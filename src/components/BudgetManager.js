import React from 'react';
import { Target, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

const BudgetManager = ({
  budgets = [],
  categories = [],
  onUpdateBudget,
  currencySymbol = '₹',
  forecastData,
  darkMode,
  cardBg,
  borderColor
}) => {
  const totalBudget = budgets.reduce((sum, b) => sum + (b.monthly_limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Budget Monitoring</h2>
              <p className="text-sm opacity-70">
                Monthly category caps, threshold warnings, and projected overruns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Budget Overview Card */}
      <div className={`${cardBg} p-6 md:p-8 rounded-2xl shadow-xl border ${borderColor}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Total Monthly Budget</span>
            <p className="text-2xl md:text-3xl font-extrabold text-blue-500 mt-1">
              {currencySymbol}{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Total Spent This Month</span>
            <p className="text-2xl md:text-3xl font-extrabold text-red-500 mt-1">
              {currencySymbol}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Unspent Buffer</span>
            <p className={`text-2xl md:text-3xl font-extrabold mt-1 ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currencySymbol}{totalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Global Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Overall Budget Consumed</span>
            <span>{overallPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPct > 100 ? 'bg-red-500' : overallPct > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        {budgets.map(b => {
          const categoryMeta = categories.find(c => c.name === b.category) || { icon: '📦' };
          const spent = b.spent || 0;
          const limit = b.monthly_limit || 0;
          const pct = b.percentage_used !== undefined ? b.percentage_used : (limit > 0 ? (spent / limit * 100) : 0);
          const remaining = limit - spent;
          const isExceeded = spent > limit;
          const isWarning = pct >= 80 && !isExceeded;

          return (
            <div
              key={b.category}
              className={`${cardBg} p-6 rounded-2xl shadow-md border ${
                isExceeded ? 'border-red-500/40 bg-red-500/5' :
                isWarning ? 'border-yellow-500/40 bg-yellow-500/5' : borderColor
              } transition-all hover:shadow-lg`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-gray-500/10">{categoryMeta.icon}</span>
                  <div>
                    <h3 className="font-bold text-base">{b.category}</h3>
                    <div className="text-xs flex items-center gap-2 mt-0.5">
                      {isExceeded ? (
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Exceeded by {currencySymbol}{Math.abs(remaining).toFixed(2)}
                        </span>
                      ) : isWarning ? (
                        <span className="text-yellow-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Warning: {(100 - pct).toFixed(0)}% remaining
                        </span>
                      ) : (
                        <span className="text-green-500 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          On track ({currencySymbol}{remaining.toFixed(2)} left)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs opacity-60 block">Spent / Cap</span>
                    <span className="font-mono font-bold text-sm">
                      {currencySymbol}{spent.toFixed(2)} / {currencySymbol}{limit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono opacity-60">₹</span>
                    <input
                      type="number"
                      step="100"
                      value={b.monthly_limit || 0}
                      onChange={(e) => onUpdateBudget(b.category, parseFloat(e.target.value) || 0)}
                      className={`w-28 px-3 py-2 rounded-xl border ${borderColor} ${cardBg} text-center font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Projected Overrun Warning if detected */}
              {b.projected_overrun > 0 && (
                <div className="mt-3 text-[11px] text-orange-400 flex items-center gap-1.5 font-medium">
                  <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Forecast indicates projected month-end overrun of {currencySymbol}{b.projected_overrun.toFixed(2)} if current pace continues.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;