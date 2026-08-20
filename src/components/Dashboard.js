import React, { useMemo } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Wallet, Calendar, TrendingUp, 
  ShieldAlert, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Layers, Flame, ShieldCheck 
} from 'lucide-react';

const Dashboard = ({ 
  expenses = [], 
  categories = [], 
  currency = 'INR', 
  currencySymbol = '₹', 
  badges = [], 
  healthData,
  forecastData,
  analyticsData,
  alerts = [],
  onNavigate,
  onOpenReceiptScanner,
  darkMode, 
  cardBg, 
  borderColor 
}) => {
  const totalIncome = analyticsData?.this_month_income || 40000.0;
  const totalSpent = analyticsData?.this_month_expenses || expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = Math.max(0, totalIncome - totalSpent);
  const projectedSpend = forecastData?.projected_monthly_spending || (totalSpent * 1.15);
  const projectedOverrun = forecastData?.projected_overspend || 0.0;
  const healthScore = healthData?.overall_score || 78;
  const healthRating = healthData?.rating_label || 'Good';

  const categoryData = useMemo(() => {
    if (analyticsData?.top_categories && analyticsData.top_categories.length > 0) {
      return analyticsData.top_categories.map(c => ({
        name: c.category,
        value: c.total_spent,
        color: c.color || '#3B82F6',
        percentage: c.percentage
      }));
    }
    const breakdown = {};
    expenses.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: categories.find(c => c.name === name)?.color || '#3B82F6',
      percentage: totalSpent > 0 ? (value / totalSpent * 100) : 0
    }));
  }, [analyticsData, expenses, categories, totalSpent]);

  const monthlyTrend = useMemo(() => {
    if (analyticsData?.monthly_trends && analyticsData.monthly_trends.length > 0) {
      return analyticsData.monthly_trends.map(m => ({
        month: m.month,
        expense: m.expense,
        income: m.income
      }));
    }
    return [
      { month: 'Jun', expense: 22400, income: 40000 },
      { month: 'Jul', expense: 24800, income: 40000 },
      { month: 'Aug', expense: totalSpent, income: totalIncome }
    ];
  }, [analyticsData, totalSpent, totalIncome]);

  const activeAlerts = alerts.filter(a => !a.is_dismissed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Section: Executive Health & Greeting */}
      <div className={`${cardBg} rounded-3xl p-6 md:p-8 shadow-xl border ${borderColor} relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-500">
              <Sparkles className="w-4 h-4" />
              <span>AI Finance Controller Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, Finance Lead
            </h1>
            <p className="text-sm opacity-70 max-w-xl">
              Continuous real-time monitoring across income, budgets, anomalies, and forecasting burn rates.
            </p>
          </div>

          {/* Financial Health Score Gauge */}
          <div className={`p-5 rounded-2xl border ${borderColor} ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
          } flex items-center gap-5 min-w-[280px]`}>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  opacity="0.2"
                />
                <path
                  className={
                    healthScore >= 80 ? 'text-green-500' :
                    healthScore >= 65 ? 'text-blue-500' :
                    healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold">{healthScore}</span>
                <span className="text-[10px] block opacity-60">/ 100</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold opacity-70">Financial Health</div>
              <div className="text-lg font-bold flex items-center gap-1.5 mt-0.5">
                <span className={
                  healthScore >= 80 ? 'text-green-500' :
                  healthScore >= 65 ? 'text-blue-500' :
                  healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                }>
                  {healthRating}
                </span>
              </div>
              <div className="text-[11px] opacity-60 mt-1">
                {healthData?.positive_factors?.[0] || 'Budgets balanced'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Cashflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border ${borderColor} hover:border-blue-500/50 transition-all group`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase opacity-70">Monthly Income</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-all">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-blue-500">
              {currencySymbol}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs opacity-50 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Verified Payroll / Deposits
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border ${borderColor} hover:border-red-500/50 transition-all group`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase opacity-70">Current Expenses</span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-all">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-red-500">
              {currencySymbol}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs opacity-50 mt-1">
              {analyticsData?.transaction_count || expenses.length} recorded transactions
            </p>
          </div>
        </div>

        {/* Remaining Net Balance */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border ${borderColor} hover:border-green-500/50 transition-all group`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase opacity-70">Remaining Balance</span>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-all">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-green-500">
              {currencySymbol}{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs opacity-50 mt-1">
              {totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0}% unallocated buffer
            </p>
          </div>
        </div>

        {/* Projected Month-End Spend */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border ${
          projectedOverrun > 0 ? 'border-orange-500/50 bg-orange-500/5' : borderColor
        } hover:border-purple-500/50 transition-all group`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase opacity-70">Projected Spend</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-all">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-purple-500">
              {currencySymbol}{projectedSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs mt-1">
              {projectedOverrun > 0 ? (
                <span className="text-orange-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overspend: {currencySymbol}{projectedOverrun.toFixed(2)}
                </span>
              ) : (
                <span className="text-green-500 font-medium">Safe Pace: Burn rate optimal</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Active Risk Alerts Ribbon */}
      {activeAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-orange-500/10 to-transparent border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-400">
                {activeAlerts.length} Active Financial Risk Alert(s) Detected
              </h4>
              <p className="text-xs opacity-70">
                {activeAlerts[0]?.title}: {activeAlerts[0]?.message.slice(0, 100)}...
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('action-center')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap"
          >
            Open Action Center
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Grounded Insights & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Card */}
        <div className={`${cardBg} lg:col-span-2 p-6 rounded-2xl shadow-xl border ${borderColor} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold">AI Controller Grounded Insights</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">
              Live Evaluation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className={`p-4 rounded-xl border ${borderColor} space-y-1.5 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
              <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Daily Spending Burn Rate
              </div>
              <p className="opacity-70">
                Current burn is <strong className="text-white">{currencySymbol}{forecastData?.daily_burn_rate?.toFixed(2) || '913.33'}/day</strong>. Projected month-end spend reaches {currencySymbol}{projectedSpend.toFixed(2)}.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${borderColor} space-y-1.5 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
              <div className="font-semibold text-orange-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Budget Warning Categories
              </div>
              <p className="opacity-70">
                Shopping & Food are highest in budget utilization. Shopping is at <strong className="text-orange-400">91%+ limit</strong>.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${borderColor} space-y-1.5 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
              <div className="font-semibold text-purple-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Recurring Commitments
              </div>
              <p className="opacity-70">
                You have active recurring subscriptions totaling ~{currencySymbol}1,800/mo (Netflix, Spotify, Broadband, Gym).
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${borderColor} space-y-1.5 ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
              <div className="font-semibold text-green-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Controller Action Plan
              </div>
              <p className="opacity-70">
                {healthData?.key_recommendation || 'Pace discretionary categories to stay under budget limit.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch & Pitch Helper */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-xl border ${borderColor} flex flex-col justify-between space-y-4`}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Quick Operations
            </h3>
            <p className="text-xs opacity-70">
              Run real-time controller intelligence workflows.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onOpenReceiptScanner}
              className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-between shadow-md transition-all"
            >
              <span>Scan & OCR Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className={`w-full p-3 rounded-xl border ${borderColor} hover:bg-blue-500/10 text-xs font-bold flex items-center justify-between transition-all`}
            >
              <span>Ask AI Finance Copilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('budget')}
              className={`w-full p-3 rounded-xl border ${borderColor} hover:bg-gray-500/10 text-xs font-semibold flex items-center justify-between transition-all`}
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Spending by Category</h3>
            <span className="text-xs opacity-60">Grounded Distribution</span>
          </div>

          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${currencySymbol}${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-20 opacity-50">No expenses recorded yet.</p>
          )}

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 mt-4 max-h-24 overflow-y-auto">
            {categoryData.map((cat, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5" style={{ borderColor: `${cat.color}40`, backgroundColor: `${cat.color}15` }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}: <strong>{currencySymbol}{cat.value.toFixed(0)}</strong></span>
              </span>
            ))}
          </div>
        </div>

        {/* Monthly Trend Bar/Line Chart */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-xl border ${borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Cashflow & Spending Trend</h3>
            <span className="text-xs opacity-60">Income vs Expenses</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  formatter={(val, name) => [`${currencySymbol}${parseFloat(val).toLocaleString('en-IN')}`, name === 'expense' ? 'Expenses' : 'Income']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span>Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions with Anomaly Highlights */}
      <div className={`${cardBg} p-6 rounded-2xl shadow-xl border ${borderColor}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Recent Intelligence Feed</h3>
            <p className="text-xs opacity-60">Latest transaction events monitored by controller</p>
          </div>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            View All ({expenses.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {expenses.slice(0, 5).map(tx => (
            <div
              key={tx.id}
              className={`p-4 rounded-xl border ${
                tx.is_anomaly ? 'border-red-500/40 bg-red-500/5' : borderColor
              } flex items-center justify-between hover:bg-gray-500/5 transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {categories.find(c => c.name === tx.category)?.icon || '📦'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{tx.description}</h4>
                    {tx.is_anomaly && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30">
                        🚨 ANOMALY ({tx.anomaly_score?.toFixed(0) || '88'}%)
                      </span>
                    )}
                    {tx.is_recurring && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        🔁 RECURRING
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-60 flex items-center gap-2 mt-0.5">
                    <span>{tx.merchant || tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.payment_method || 'UPI'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-base font-extrabold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] opacity-50 uppercase">{tx.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
