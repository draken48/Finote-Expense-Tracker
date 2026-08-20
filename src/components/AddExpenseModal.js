import React, { useState } from 'react';
import { X, Mic, Camera, Wand2, Plus, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';

const AddExpenseModal = ({ onClose, onAdd, onOpenReceiptScanner, categories = [], darkMode }) => {
  const [type, setType] = useState('expense');
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: categories[0]?.name || 'Food & Dining',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    tags: '',
    recurring: false,
    recurringInterval: 'monthly',
    mood: 'neutral'
  });
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);

  const handleAutoCategory = async (textToCategorize) => {
    const text = textToCategorize || formData.description || formData.merchant;
    if (!text.trim()) {
      alert('Please enter a description or merchant first!');
      return;
    }

    setAiSuggesting(true);
    try {
      const res = await api.autoCategorize({
        description: text,
        merchant: formData.merchant,
        amount: parseFloat(formData.amount) || undefined
      });
      setFormData(prev => ({
        ...prev,
        category: res.category,
        merchant: prev.merchant || res.merchant,
        type: res.type
      }));
      setType(res.type);
      setAiConfidence(res.confidence);
    } catch (err) {
      console.warn('AI categorization fallback');
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleVoiceInput = () => {
    const simulatedTranscripts = [
      { text: "Paid ₹850 on Swiggy for team lunch pizza", amount: "850.00", merchant: "Swiggy", desc: "Team lunch pizza" },
      { text: "Bought ₹2,499 chair cushion on Amazon", amount: "2499.00", merchant: "Amazon", desc: "Chair cushion" },
      { text: "Uber cab to office ₹340", amount: "340.00", merchant: "Uber", desc: "Uber cab to office" }
    ];
    const sample = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
    
    setFormData(prev => ({
      ...prev,
      description: sample.desc,
      merchant: sample.merchant,
      amount: sample.amount
    }));
    handleAutoCategory(sample.desc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const rawValue = formData.amount?.toString().trim();
    const amount = parseFloat(rawValue);

    if (!rawValue || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    onAdd({
      amount: Math.round(amount * 100) / 100,
      type: type,
      category: formData.category,
      merchant: formData.merchant || formData.description.split(' ')[0],
      description: formData.description,
      date: formData.date,
      payment_method: formData.payment_method,
      source: 'manual',
      is_recurring: formData.recurring,
      recurring_interval: formData.recurring ? formData.recurringInterval : null,
      tags: formData.tags,
      mood: formData.mood
    });

    onClose();
  };

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${cardBg} rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${cardBg} z-10`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Record Transaction</h2>
              <p className="text-xs opacity-60">Finance Controller Transaction Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Methods Bar */}
        <div className={`p-4 border-b ${borderColor} ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                Voice Input
              </button>
              {onOpenReceiptScanner && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReceiptScanner();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan Receipt
                </button>
              )}
            </div>

            {/* Income / Expense Switcher */}
            <div className="flex rounded-xl p-1 bg-gray-500/10 border border-gray-500/20">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <ArrowDownRight className="w-3 h-3" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  type === 'income' ? 'bg-green-500 text-white shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <ArrowUpRight className="w-3 h-3" />
                Income
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-gray-400">₹</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border ${borderColor} ${cardBg} text-xl font-extrabold focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description & Auto Categorize */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Description / Purpose <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleAutoCategory()}
                disabled={aiSuggesting}
                className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                Auto-Categorize
              </button>
            </div>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => {
                if (formData.description && !formData.merchant) {
                  handleAutoCategory(formData.description);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="e.g. Swiggy Lunch, Amazon Shoes, Monthly Rent"
              required
            />
          </div>

          {/* Merchant & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Merchant / Entity
              </label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="e.g. Swiggy, Uber, Croma"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Category
                </label>
                {aiConfidence && (
                  <span className="text-[10px] font-bold text-green-500">
                    {Math.round(aiConfidence * 100)}% Match
                  </span>
                )}
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking / IMPS</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Recurring Expense Checkbox */}
          <div className={`p-4 rounded-xl border ${borderColor} space-y-2`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold">Mark as Recurring Commitment / Subscription</span>
            </label>
            {formData.recurring && (
              <select
                value={formData.recurringInterval}
                onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${cardBg} text-xs mt-1`}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Save & Run Controller Checks
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3.5 rounded-xl border ${borderColor} font-semibold text-xs`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
