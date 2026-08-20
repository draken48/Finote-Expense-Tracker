import React, { useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';

const GoalsManager = ({ goals = [], setGoals, currencySymbol = '₹', darkMode, cardBg, borderColor }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: 0, deadline: '' });

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      alert('Please enter a goal name and target amount');
      return;
    }

    setGoals([...goals, {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: 0,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString()
    }]);

    setNewGoal({ name: '', target: '', current: 0, deadline: '' });
    setShowAddGoal(false);
  };

  const updateGoalProgress = (id, amount) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, current: parseFloat(amount) || 0 } : goal
    ));
  };

  const deleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Savings Milestones</h2>
              <p className="text-sm opacity-70">
                Target funds, liquidity buffers, and financial goal tracking.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Add Goal Modal/Form */}
      {showAddGoal && (
        <div className={`${cardBg} p-6 rounded-2xl shadow-xl border ${borderColor} space-y-4`}>
          <h3 className="font-bold text-base">New Financial Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Goal name (e.g., Emergency Fund)"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className={`px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
            />
            <input
              type="number"
              step="100"
              placeholder="Target Amount (₹)"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              className={`px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none`}
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className={`px-4 py-2.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={addGoal}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Save Goal
            </button>
            <button
              onClick={() => setShowAddGoal(false)}
              className={`px-4 py-2.5 rounded-xl border ${borderColor} text-xs font-semibold`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-2xl shadow-sm border ${borderColor} text-center`}>
          <Target className="w-16 h-16 mx-auto mb-4 opacity-30 text-blue-500" />
          <p className="opacity-60 text-sm mb-4">No savings goals created yet. Set up your emergency fund or milestone target.</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = goal.target > 0 ? (goal.current / goal.target * 100) : 0;
            const remaining = Math.max(0, goal.target - goal.current);
            const isAchieved = pct >= 100;

            return (
              <div
                key={goal.id}
                className={`${cardBg} p-6 rounded-2xl shadow-md border ${
                  isAchieved ? 'border-green-500/40 bg-green-500/5' : borderColor
                } space-y-4 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      {goal.name}
                    </h3>
                    <div className="text-xs opacity-60 flex items-center gap-2">
                      <span>Target: {currencySymbol}{goal.target.toLocaleString('en-IN')}</span>
                      {goal.deadline && (
                        <>
                          <span>•</span>
                          <span>Deadline: {goal.deadline}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Numbers */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-blue-500 text-sm">
                      {currencySymbol}{goal.current.toLocaleString('en-IN')}
                    </span>
                    <span className="opacity-60">
                      {isAchieved ? 'Target Achieved' : `${currencySymbol}${remaining.toLocaleString('en-IN')} to go`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Progress Modifier */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="500"
                    value={goal.current || 0}
                    onChange={(e) => updateGoalProgress(goal.id, e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-xl border ${borderColor} ${cardBg} text-xs font-semibold outline-none`}
                    placeholder="Update progress"
                  />
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.current + 1000)}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl text-xs font-bold border border-blue-500/20 transition-all"
                  >
                    +₹1,000
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsManager;