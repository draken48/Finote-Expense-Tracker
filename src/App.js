import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, TrendingUp, Target, Award, MessageSquare, 
  Settings as SettingsIcon, Plus, Moon, Sun, Zap, 
  ShieldAlert, Camera
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ActionCenter from './components/ActionCenter';
import ExpensesList from './components/ExpensesList';
import BudgetManager from './components/BudgetManager';
import GoalsManager from './components/GoalsManager';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import AddExpenseModal from './components/AddExpenseModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import { api } from './api/client';
import { loadData, saveData } from './utils/storage';
import './styles/App.css';

const CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6384', icon: '🍔' },
  { name: 'Shopping', color: '#FFCE56', icon: '🛍️' },
  { name: 'Transportation', color: '#36A2EB', icon: '🚗' },
  { name: 'Entertainment', color: '#4BC0C0', icon: '🎬' },
  { name: 'Bills & Utilities', color: '#9966FF', icon: '💡' },
  { name: 'Healthcare', color: '#FF9F40', icon: '🏥' },
  { name: 'Education', color: '#EC4899', icon: '📚' },
  { name: 'Investments', color: '#10B981', icon: '📈' },
  { name: 'Income', color: '#3B82F6', icon: '💰' },
  { name: 'Others', color: '#9CA3AF', icon: '📦' }
];

const CURRENCY_SYMBOLS = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$'
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [streak, setStreak] = useState(7);
  const [badges] = useState(['Fintech Pioneer', 'Controller Active', 'Budget Guard']);
  const [notifications, setNotifications] = useState(true);

  // Core Data States
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Fetch all grounded data from backend
  const refreshAllData = useCallback(async () => {
    try {
      const [txList, budgetList, analyticsRes, forecastRes, healthRes, alertList] = await Promise.all([
        api.getTransactions().catch(() => []),
        api.getBudgets().catch(() => []),
        api.getAnalytics().catch(() => null),
        api.getForecast().catch(() => null),
        api.getFinancialHealth().catch(() => null),
        api.getAlerts().catch(() => ({ alerts: [] }))
      ]);

      if (txList && txList.length > 0) {
        setExpenses(txList);
      } else {
        const cached = loadData();
        if (cached.expenses) setExpenses(cached.expenses);
      }

      if (budgetList && budgetList.length > 0) setBudgets(budgetList);
      if (analyticsRes) setAnalyticsData(analyticsRes);
      if (forecastRes) setForecastData(forecastRes);
      if (healthRes) setHealthData(healthRes);
      if (alertList && alertList.alerts) setAlerts(alertList.alerts);

    } catch (err) {
      console.warn('Backend sync failed, maintaining client cache:', err.message);
    }
  }, []);

  useEffect(() => {
    const cached = loadData();
    if (cached.settings) {
      setDarkMode(cached.settings.darkMode !== false);
      setCurrency(cached.settings.currency || 'INR');
      setNotifications(cached.settings.notifications !== false);
    }
    if (cached.goals) setGoals(cached.goals);
    if (cached.streak) setStreak(cached.streak);

    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    saveData({
      expenses,
      budgets,
      goals,
      settings: { darkMode, currency, notifications },
      streak,
      badges
    });
  }, [expenses, budgets, goals, darkMode, currency, streak, badges, notifications]);

  const handleAddTransaction = async (txData) => {
    try {
      const newTx = await api.createTransaction(txData);
      setExpenses(prev => [newTx, ...prev]);
      setStreak(prev => prev + 1);
      refreshAllData();
    } catch (err) {
      const fallbackTx = {
        id: Date.now(),
        ...txData,
        amount: parseFloat(txData.amount),
        is_anomaly: false,
        created_at: new Date().toISOString()
      };
      setExpenses(prev => [fallbackTx, ...prev]);
    }
  };

  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      const updated = await api.updateTransaction(id, updatedData);
      setExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
      refreshAllData();
    } catch (err) {
      setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedData } : exp));
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(id);
        setExpenses(prev => prev.filter(exp => exp.id !== id));
        refreshAllData();
      } catch (err) {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
      }
    }
  };

  const handleUpdateBudget = async (category, monthly_limit) => {
    try {
      await api.setBudget({ category, monthly_limit, warning_threshold: 80.0 });
      refreshAllData();
    } catch (err) {
      setBudgets(prev => prev.map(b => b.category === category ? { ...b, monthly_limit } : b));
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await api.dismissAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  const handleSeedDemo = async () => {
    try {
      await api.seedDemoData();
      await refreshAllData();
      setCurrentView('dashboard');
    } catch (err) {
      throw new Error('Demo seed failed. Please ensure the FastAPI backend is running on port 8000.');
    }
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '₹';
  const theme = darkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-800' : 'border-gray-200/80';
  const activeAlertsCount = alerts.filter(a => !a.is_dismissed && (a.severity === 'critical' || a.severity === 'high')).length;

  return (
    <div className={`min-h-screen ${theme} transition-colors duration-300 font-sans`}>

      {/* Main Header */}
      <header className={`${cardBg} sticky top-0 z-50 border-b ${borderColor} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">Finote AI</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Controller v2.0
                </span>
              </div>
              <p className="text-[11px] opacity-60">Intelligent Finance Controller</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {healthData && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-xs font-bold">
                <span className="opacity-60">Health:</span>
                <span className={
                  healthData.overall_score >= 80 ? 'text-green-500' :
                  healthData.overall_score >= 65 ? 'text-blue-500' :
                  healthData.overall_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                }>
                  {healthData.overall_score}/100
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>{streak}d Streak</span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border ${borderColor} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Subheader */}
      <nav className={`${cardBg} border-b ${borderColor} sticky top-[57px] z-40`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'action-center', icon: ShieldAlert, label: 'Action Center', badge: activeAlertsCount },
              { id: 'expenses', icon: Wallet, label: 'Transactions' },
              { id: 'budget', icon: Target, label: 'Budgets' },
              { id: 'goals', icon: Award, label: 'Goals' },
              { id: 'ai', icon: MessageSquare, label: 'AI Copilot' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : `${darkMode ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            expenses={expenses}
            categories={CATEGORIES}
            currency={currency}
            currencySymbol={currencySymbol}
            badges={badges}
            healthData={healthData}
            forecastData={forecastData}
            analyticsData={analyticsData}
            alerts={alerts}
            onNavigate={setCurrentView}
            onOpenReceiptScanner={() => setShowReceiptScanner(true)}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}

        {currentView === 'action-center' && (
          <ActionCenter 
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            onViewCategory={() => setCurrentView('budget')}
            onReviewTransaction={() => setCurrentView('expenses')}
            currencySymbol={currencySymbol}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'expenses' && (
          <ExpensesList 
            expenses={expenses}
            categories={CATEGORIES}
            updateExpense={handleUpdateTransaction}
            deleteExpense={handleDeleteTransaction}
            currency={currency}
            currencySymbol={currencySymbol}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'budget' && (
          <BudgetManager 
            budgets={budgets}
            categories={CATEGORIES}
            onUpdateBudget={handleUpdateBudget}
            currencySymbol={currencySymbol}
            forecastData={forecastData}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'goals' && (
          <GoalsManager 
            goals={goals}
            setGoals={setGoals}
            currencySymbol={currencySymbol}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'ai' && (
          <AIAssistant 
            expenses={expenses}
            currencySymbol={currencySymbol}
            healthData={healthData}
            forecastData={forecastData}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'settings' && (
          <Settings 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currency={currency}
            setCurrency={setCurrency}
            notifications={notifications}
            setNotifications={setNotifications}
            expenses={expenses}
            setExpenses={setExpenses}
            budgets={budgets}
            setBudgets={setBudgets}
            goals={goals}
            setGoals={setGoals}
            onSeedDemo={handleSeedDemo}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <button
          onClick={() => setShowReceiptScanner(true)}
          className="w-13 h-13 p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          title="Scan Receipt"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowAddExpense(true)}
          className="w-14 h-14 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
          title="Record Transaction"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showAddExpense && (
        <AddExpenseModal 
          onClose={() => setShowAddExpense(false)}
          onAdd={handleAddTransaction}
          onOpenReceiptScanner={() => setShowReceiptScanner(true)}
          categories={CATEGORIES}
          darkMode={darkMode}
        />
      )}

      {showReceiptScanner && (
        <ReceiptScannerModal 
          onClose={() => setShowReceiptScanner(false)}
          onConfirmTransaction={handleAddTransaction}
          categories={CATEGORIES}
          darkMode={darkMode}
          cardBg={cardBg}
          borderColor={borderColor}
        />
      )}
    </div>
  );
}

export default App;
