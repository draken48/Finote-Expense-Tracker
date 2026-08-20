import re
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.receipt import ReceiptRecord
from app.services.categorization_service import categorize_transaction
from app.config import settings

def parse_receipt_text_or_image(text_content: str, image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
    """
    Parses OCR text or structured receipt payload to extract merchant, amount, date, items, tax, and category.
    """
    lines = [l.strip() for l in text_content.split('\n') if l.strip()]
    
    merchant = "Unknown Store"
    amount = 0.0
    tax = 0.0
    date_str = datetime.now().strftime("%Y-%m-%d")
    line_items: List[Dict[str, Any]] = []
    payment_method = "UPI"
    
    # 1. Merchant Detection (usually in first 3 lines)
    for line in lines[:4]:
        clean_line = line.lower()
        if any(kw in clean_line for kw in ["starbucks", "swiggy", "zomato", "mcdonald", "subway", "croma", "reliance", "apollo", "supermarket", "cafe", "store", "mart", "retail"]):
            merchant = line.title()
            break
        elif len(line) > 3 and not re.search(r'\d', line):
            merchant = line.title()
            break
            
    # 2. Amount Detection
    amount_candidates = []
    for line in lines:
        # Match currency numbers like ₹487.50, 487.00, Rs 500, TOTAL: 487
        matches = re.findall(r'(?:(?:total|grand total|amount|rs\.?|₹)\s*[:=]?\s*)?([0-9]+(?:[\.,][0-9]{2})?)', line, re.IGNORECASE)
        for m in matches:
            try:
                val = float(m.replace(',', '.'))
                if val > 0:
                    amount_candidates.append((val, "total" in line.lower() or "grand" in line.lower()))
            except ValueError:
                continue
                
    if amount_candidates:
        # Prioritize amounts associated with 'total' or the maximum plausible amount
        priority_totals = [val for val, is_total in amount_candidates if is_total]
        if priority_totals:
            amount = priority_totals[-1]
        else:
            amount = max(val for val, _ in amount_candidates)

    # 3. Date Detection
    for line in lines:
        date_match = re.search(r'(\d{4}[-/]\d{2}[-/]\d{2})|(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', line)
        if date_match:
            try:
                raw_d = date_match.group(0).replace('/', '-')
                # Normalize date
                parts = raw_d.split('-')
                if len(parts[0]) == 4: # YYYY-MM-DD
                    date_str = raw_d
                elif len(parts[2]) == 4: # DD-MM-YYYY
                    date_str = f"{parts[2]}-{int(parts[1]):02d}-{int(parts[0]):02d}"
                break
            except Exception:
                pass

    # 4. Tax Detection
    for line in lines:
        if "tax" in line.lower() or "gst" in line.lower() or "vat" in line.lower():
            tax_match = re.search(r'([0-9]+(?:[\.,][0-9]{2})?)', line)
            if tax_match:
                try:
                    tax = float(tax_match.group(1).replace(',', '.'))
                except ValueError:
                    pass

    # 5. Payment Method
    full_text = " ".join(lines).lower()
    if "upi" in full_text or "gpay" in full_text or "phonepe" in full_text or "paytm" in full_text:
        payment_method = "UPI"
    elif "credit card" in full_text or "visa" in full_text or "mastercard" in full_text:
        payment_method = "Credit Card"
    elif "cash" in full_text:
        payment_method = "Cash"

    # 6. Categorization
    cat_result = categorize_transaction(description=merchant, merchant=merchant, amount=amount)
    category = cat_result["category"]
    
    # 7. Line items extraction
    for line in lines:
        item_match = re.match(r'^(?:[0-9]+\.\s*)?([a-zA-Z\s]+?)\s+([0-9]+(?:\.[0-9]{2})?)$', line)
        if item_match and not any(skip in line.lower() for skip in ["total", "subtotal", "tax", "gst", "change", "cash"]):
            item_desc = item_match.group(1).strip()
            item_amt = float(item_match.group(2))
            if item_amt > 0 and len(item_desc) > 2:
                line_items.append({"description": item_desc, "amount": item_amt, "quantity": 1})

    confidence = 0.94 if amount > 0 and merchant != "Unknown Store" else 0.70

    return {
        "merchant": merchant,
        "amount": round(amount, 2),
        "tax": round(tax, 2),
        "date": date_str,
        "category": category,
        "payment_method": payment_method,
        "confidence_score": confidence,
        "line_items": line_items,
        "raw_text": text_content
    }

def process_receipt_upload(db: Session, raw_text: str, user_id: int = 1) -> Dict[str, Any]:
    extracted = parse_receipt_text_or_image(raw_text)
    
    receipt = ReceiptRecord(
        user_id=user_id,
        merchant=extracted["merchant"],
        amount=extracted["amount"],
        tax=extracted["tax"],
        date=extracted["date"],
        category=extracted["category"],
        payment_method=extracted["payment_method"],
        raw_text=raw_text,
        line_items_json=json.dumps(extracted["line_items"]),
        confidence_score=extracted["confidence_score"],
        status="processed"
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    
    extracted["receipt_id"] = receipt.id
    return extracted
