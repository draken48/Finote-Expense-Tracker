import re
from typing import Tuple, Dict, Any

CATEGORY_RULES = {
    "Food & Dining": [
        "swiggy", "zomato", "starbucks", "mcdonald", "subway", "domino", "kfc", "pizza",
        "burger", "cafe", "restaurant", "lunch", "dinner", "breakfast", "food", "bakery",
        "chai", "tea", "coffee", "dhaba", "bar", "pub", "supermarket", "grocery", "zepto",
        "blinkit", "instamart", "bigbasket", "dunzo"
    ],
    "Transportation": [
        "uber", "ola", "rapido", "metro", "fuel", "petrol", "diesel", "gas", "parking",
        "toll", "fastag", "bus", "train", "irctc", "flight", "indigo", "air india",
        "spicejet", "auto", "cab", "transport"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "nike", "clothes", "shoes",
        "electronics", "croma", "reliance digital", "apple", "retail", "shop", "mall",
        "fashion", "purchase", "store"
    ],
    "Entertainment": [
        "netflix", "spotify", "prime video", "hotstar", "youtube", "cinema", "pvr",
        "inox", "movie", "bookmyshow", "game", "gaming", "steam", "concert", "music",
        "subscription", "theatre"
    ],
    "Bills & Utilities": [
        "electricity", "water", "wifi", "internet", "airtel", "jio", "vi", "broadband",
        "recharge", "rent", "maintenance", "gas bill", "utility", "insurance", "lic",
        "hdfc life", "loan", "emi", "credit card payment"
    ],
    "Healthcare": [
        "pharmacy", "apollo", "medplus", "1mg", "pharmeasy", "doctor", "hospital",
        "clinic", "dental", "medicine", "health", "consultation", "lab test", "diagnostics"
    ],
    "Education": [
        "course", "udemy", "coursera", "books", "tuition", "school", "college",
        "university", "training", "workshop", "exam fee", "certification"
    ],
    "Investments": [
        "zerodha", "groww", "upstox", "mutual fund", "sip", "stocks", "crypto",
        "gold", "fixed deposit", "fd", "rd", "savings"
    ],
    "Income": [
        "salary", "payroll", "freelance", "dividend", "interest", "refund", "bonus",
        "cashback", "stipend", "credit"
    ]
}

MERCHANT_MAP = {
    "swiggy": ("Swiggy", "Food & Dining"),
    "zomato": ("Zomato", "Food & Dining"),
    "blinkit": ("Blinkit", "Food & Dining"),
    "zepto": ("Zepto", "Food & Dining"),
    "instamart": ("Swiggy Instamart", "Food & Dining"),
    "starbucks": ("Starbucks", "Food & Dining"),
    "mcdonald": ("McDonald's", "Food & Dining"),
    "dominos": ("Domino's Pizza", "Food & Dining"),
    "uber": ("Uber", "Transportation"),
    "ola": ("Ola Cabs", "Transportation"),
    "rapido": ("Rapido", "Transportation"),
    "irctc": ("IRCTC", "Transportation"),
    "amazon": ("Amazon", "Shopping"),
    "flipkart": ("Flipkart", "Shopping"),
    "myntra": ("Myntra", "Shopping"),
    "netflix": ("Netflix", "Entertainment"),
    "spotify": ("Spotify", "Entertainment"),
    "hotstar": ("Disney+ Hotstar", "Entertainment"),
    "bookmyshow": ("BookMyShow", "Entertainment"),
    "airtel": ("Airtel", "Bills & Utilities"),
    "jio": ("Jio", "Bills & Utilities"),
    "apollo": ("Apollo Pharmacy", "Healthcare"),
    "1mg": ("Tata 1mg", "Healthcare"),
    "zerodha": ("Zerodha", "Investments"),
    "groww": ("Groww", "Investments")
}

def categorize_transaction(description: str, merchant: str = None, amount: float = None) -> Dict[str, Any]:
    text = f"{merchant or ''} {description}".lower().strip()
    
    # Check known merchant patterns
    for key, (canonical_name, cat) in MERCHANT_MAP.items():
        if key in text:
            trans_type = "income" if cat == "Income" else "expense"
            return {
                "merchant": canonical_name,
                "category": cat,
                "type": trans_type,
                "confidence": 0.96,
                "reason": f"Matched known merchant '{canonical_name}' in category '{cat}'"
            }
            
    # Check keyword rules
    for category, keywords in CATEGORY_RULES.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text) or kw in text:
                trans_type = "income" if category == "Income" else "expense"
                # Derive clean merchant name if possible
                derived_merchant = merchant or kw.capitalize()
                return {
                    "merchant": derived_merchant,
                    "category": category,
                    "type": trans_type,
                    "confidence": 0.88,
                    "reason": f"Matched keyword '{kw}' strongly associated with '{category}'"
                }

    # Income keyword check
    if any(inc in text for inc in ["salary", "credited", "refund", "stipend", "bonus", "dividend"]):
        return {
            "merchant": merchant or "Employer / Source",
            "category": "Income",
            "type": "income",
            "confidence": 0.92,
            "reason": "Transaction text matches income deposit pattern"
        }

    return {
        "merchant": merchant or (description.split()[0].capitalize() if description else "Other"),
        "category": "Others",
        "type": "expense",
        "confidence": 0.50,
        "reason": "Unrecognized merchant/description, defaulted to Others with moderate confidence"
    }
