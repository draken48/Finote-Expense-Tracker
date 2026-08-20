import React, { useState } from 'react';
import { 
  Moon, Sun, DollarSign, Download, Upload, Trash2, 
  RefreshCw, Sparkles, Database, AlertTriangle, CheckCircle
} from 'lucide-react';

const Settings = ({ 
  darkMode, 
  setDarkMode, 
  currency, 
  setCurrency, 
  notifications, 
  setNotifications,
  expenses = [],
  setExpenses,
  budgets = [],
  setBudgets,
  goals = [],
  setGoals,
  onSeedDemo,
  cardBg, 
  borderColor 
}) => {
  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  const [demoSeeding, setDemoSeeding] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  const handleSeedDemo = async () => {
    setDemoSeeding(true);
    setDemoSuccess(false);
    try {
      await onSeedDemo();
      setDemoSuccess(true);
      setTimeout(() => setDemoSuccess(false), 3000);
    } catch (e) {
      // error handled in parent
    } finally {
      setDemoSeeding(false);
    }
  };

  const exportAllData = () => {
    const data = {
      expenses,
      budgets,
      goals,
      settings: { darkMode, currency, notifications },
      exportDate: new Date().toISOString(),
      platform: 'Finote AI — Intelligent Finance Controller'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finote-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (window.confirm('This will restore all data from the selected backup file. Continue?')) {
          if (data.expenses) setExpenses(data.expenses);
          if (data.budgets) setBudgets(data.budgets);
          if (data.goals) setGoals(data.goals);
          if (data.settings) {
            setDarkMode(data.settings.darkMode);
            setCurrency(data.settings.currency);
            setNotifications(data.settings.notifications);
          }
          alert('Backup restored successfully!');
        }
      } catch (error) {
        alert('Error importing data. Please ensure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ This will permanently erase all local records. The backend database will need to be reset separately. Continue?')) {
      setExpenses([]);
      setBudgets([]);
      setGoals([]);
      alert('Local cache cleared. Reload the page to fetch fresh data from the backend.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
        <p className="text-sm opacity-70">
          Manage preferences, demo data, and backup controls.
        </p>
      </div>

      {/* Demo Mode Card — clearly labeled as synthetic */}
      <div className={`${cardBg} p-6 rounded-2xl shadow-xl border border-purple-500/30 space-y-4`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base">Demo Mode</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                Synthetic Data
              </span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              Loads a pre-built synthetic financial scenario for demonstration purposes. 
              This is <strong>not real financial data</strong>. It includes ₹40,000 income, 
              realistic recurring expenses, and a deliberate spending anomaly (₹7,850 Croma Electronics) 
              to demonstrate the controller's anomaly detection capabilities.
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs font-medium flex items-start gap-2 text-amber-600 dark:text-amber-400`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Loading demo data will <strong>clear all existing records</strong> in the backend database and replace them with the synthetic scenario. 
            Export a backup first if you have real data you want to keep.
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSeedDemo}
            disabled={demoSeeding}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
              demoSuccess
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
            } disabled:opacity-60`}
          >
            {demoSeeding ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading Demo Data...</>
            ) : demoSuccess ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Demo Data Loaded!</>
            ) : (
              <><RefreshCw className="w-3.5 h-3.5" /> Launch Demo Mode</>
            )}
          </button>
          <p className="text-xs opacity-50 self-center">Uses synthetic financial data only</p>
        </div>
      </div>

      {/* Appearance & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-md border ${borderColor} space-y-4`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            {darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            Theme Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Fintech Dark Mode</p>
              <p className="text-xs opacity-60">High-contrast dark theme optimized for metrics</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Currency */}
        <div className={`${cardBg} p-6 rounded-2xl shadow-md border ${borderColor} space-y-4`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Base Currency
          </h3>
          <div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
            >
              {currencies.map(curr => (
                <option key={curr} value={curr}>
                  {curr} ({curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'JPY' ? '¥' : curr === 'AUD' ? 'A$' : 'C$'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={`${cardBg} p-6 rounded-2xl shadow-md border ${borderColor} space-y-4`}>
        <h3 className="text-base font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          Data Backup & Recovery
        </h3>
        <p className="text-xs opacity-60">
          Export or restore your financial records. The backend SQLite database stores all transaction data.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportAllData}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Backup (JSON)
          </button>
          
          <label className={`p-3 border ${borderColor} hover:bg-gray-500/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all`}>
            <Upload className="w-4 h-4 text-green-500" />
            Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            onClick={clearAllData}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Local Cache
          </button>
        </div>
      </div>

      {/* About */}
      <div className={`${cardBg} p-6 rounded-2xl shadow-md border ${borderColor} space-y-3`}>
        <h3 className="text-base font-bold">About Finote AI</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Platform', value: 'Finote AI v2.0' },
            { label: 'Controller Loop', value: 'Observe → Detect → Act' },
            { label: 'Health Score', value: 'Deterministic (6 dimensions)' },
            { label: 'Anomaly Engine', value: 'Statistical Z-Score + IQR' },
            { label: 'Forecasting', value: 'Linear Burn-Rate Projection' },
            { label: 'AI Copilot', value: 'Grounded Tool-Calling Agent (14 tools)' },
          ].map((item) => (
            <div key={item.label} className={`p-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-50 font-bold">{item.label}</div>
              <div className="font-semibold mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;