import React, { useState } from 'react';
import { 
  Edit2, Trash2, Save, Download, ShieldAlert, 
  Search 
} from 'lucide-react';

const ExpensesList = ({
  expenses = [],
  categories = [],
  updateExpense,
  deleteExpense,
  onUpdateAnomalyStatus,
  currency = 'INR',
  currencySymbol = '₹',
  darkMode,
  cardBg,
  borderColor
}) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Merchant', 'Description', 'Amount', 'Payment Method', 'Is Anomaly', 'Source'];
    const rows = expenses.map(exp => [
      exp.id,
      exp.date,
      exp.type || 'expense',
      exp.category,
      `"${exp.merchant || ''}"`,
      `"${exp.description}"`,
      exp.amount,
      exp.payment_method || 'UPI',
      exp.is_anomaly ? 'YES' : 'NO',
      exp.source || 'manual'
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finote-intelligence-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesType = filterType === 'all' || exp.type === filterType;
    const matchesAnomaly = !filterAnomaly || exp.is_anomaly;
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.merchant && exp.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesType && matchesAnomaly && matchesSearch;
  });

  const handleSave = () => {
    updateExpense(editingExpense.id, editingExpense);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Ledger ({expenses.length})</h2>
          <p className="text-sm opacity-70">
            Real-time transaction events, anomaly detection tags, and metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`${cardBg} p-4 rounded-2xl shadow-md border ${borderColor} flex flex-wrap gap-3 items-center justify-between`}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 opacity-50" />
          <input
            type="text"
            placeholder="Search description, merchant, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border ${borderColor} ${cardBg} text-xs focus:ring-2 focus:ring-blue-500 outline-none`}
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${borderColor} ${cardBg} outline-none`}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 rounded-xl border ${borderColor} ${cardBg} outline-none`}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          <button
            onClick={() => setFilterAnomaly(!filterAnomaly)}
            className={`px-3 py-2 rounded-xl font-semibold border transition-all flex items-center gap-1.5 ${
              filterAnomaly
                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                : `${borderColor} hover:bg-gray-500/10`
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Anomalies Only
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filteredExpenses.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-2xl shadow-sm border ${borderColor} text-center`}>
          <p className="opacity-60 text-sm">
            No transactions match your search filters. Try adjusting your query or recording a new transaction.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(expense => (
            <div
              key={expense.id}
              className={`${cardBg} p-5 rounded-2xl shadow-md border ${
                expense.is_anomaly ? 'border-red-500/40 bg-red-500/5' : borderColor
              } transition-all hover:shadow-lg`}
            >
              {editingExpense?.id === expense.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                      className={`px-3 py-2 rounded-xl border ${borderColor} ${cardBg} text-sm font-bold`}
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={editingExpense.merchant || ''}
                      onChange={(e) => setEditingExpense({ ...editingExpense, merchant: e.target.value })}
                      className={`px-3 py-2 rounded-xl border ${borderColor} ${cardBg} text-sm`}
                      placeholder="Merchant"
                    />
                    <select
                      value={editingExpense.category}
                      onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                      className={`px-3 py-2 rounded-xl border ${borderColor} ${cardBg} text-sm`}
                    >
                      {categories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${borderColor} ${cardBg} text-sm`}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingExpense(null)}
                      className={`px-4 py-2 rounded-xl border ${borderColor} text-xs font-medium`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2 rounded-xl bg-gray-500/10 flex-shrink-0">
                      {categories.find(c => c.name === expense.category)?.icon || '📦'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-base">{expense.description}</h4>
                        {expense.is_anomaly && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30">
                            🚨 ANOMALY ({expense.anomaly_score?.toFixed(0) || '88'}%)
                          </span>
                        )}
                        {expense.is_recurring && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            🔁 RECURRING
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs opacity-60">
                        <span className="font-medium text-blue-400">{expense.category}</span>
                        <span>•</span>
                        <span>{expense.merchant || 'Direct'}</span>
                        <span>•</span>
                        <span>{expense.date}</span>
                        <span>•</span>
                        <span>{expense.payment_method || 'UPI'}</span>
                      </div>
                      {expense.anomaly_reason && expense.is_anomaly && (
                        <p className="text-[11px] text-red-400 font-medium pt-1">
                          Reason: {expense.anomaly_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className={`text-lg font-extrabold block ${expense.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {expense.type === 'income' ? '+' : '-'}{currencySymbol}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] opacity-50 uppercase font-mono">{expense.type || 'expense'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className={`p-2 rounded-xl border ${borderColor} hover:bg-blue-500/10 text-blue-500 transition-all`}
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className={`p-2 rounded-xl border ${borderColor} hover:bg-red-500/10 text-red-500 transition-all`}
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesList;
