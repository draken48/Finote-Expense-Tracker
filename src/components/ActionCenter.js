import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, TrendingDown, Sparkles, CheckCircle, 
  ArrowRight, ShieldCheck 
} from 'lucide-react';

const ActionCenter = ({
  alerts = [],
  onDismissAlert,
  onViewCategory,
  onReviewTransaction,
  currencySymbol = '₹',
  darkMode,
  cardBg,
  borderColor
}) => {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.severity === 'critical' || alert.severity === 'high';
    if (filter === 'budget') return alert.type === 'budget_risk';
    if (filter === 'anomaly') return alert.type === 'spending_anomaly';
    if (filter === 'forecast') return alert.type === 'forecast_warning';
    if (filter === 'recommendation') return alert.type === 'recommendation';
    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">CRITICAL RISK</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-500 border border-orange-500/30">HIGH ALERT</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">ATTENTION</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500 border border-blue-500/30">RECOMMENDATION</span>;
    }
  };

  const getIcon = (type, severity) => {
    if (type === 'spending_anomaly') return <ShieldAlert className="w-6 h-6 text-red-500" />;
    if (type === 'budget_risk') return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    if (type === 'forecast_warning') return <TrendingDown className="w-6 h-6 text-purple-500" />;
    return <Sparkles className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Finance Action Center</h2>
              <p className="text-sm opacity-70">
                Proactive intelligence, detected risk events, and autonomous recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'all', label: `All (${alerts.length})` },
            { id: 'critical', label: 'Critical / High' },
            { id: 'budget', label: 'Budget Risks' },
            { id: 'anomaly', label: 'Spending Anomalies' },
            { id: 'forecast', label: 'Forecast Warnings' },
            { id: 'recommendation', label: 'Recommendations' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream */}
      {filteredAlerts.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-2xl shadow-sm border ${borderColor} text-center`}>
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">All Financial Parameters Safe</h3>
          <p className="text-sm opacity-60 max-w-md mx-auto mt-1">
            No active risks or spending anomalies detected for your selected filter. Your controller is continuously monitoring incoming events.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`${cardBg} rounded-2xl shadow-md border ${
                alert.severity === 'critical' ? 'border-red-500/40' :
                alert.severity === 'high' ? 'border-orange-500/40' : borderColor
              } p-6 transition-all hover:shadow-lg relative overflow-hidden`}
            >
              {/* Severity Side Strip */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'high' ? 'bg-orange-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
              />

              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-500/10' :
                    alert.severity === 'high' ? 'bg-orange-500/10' :
                    alert.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}>
                    {getIcon(alert.type, alert.severity)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      {alert.category && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/10 opacity-80">
                          {alert.category}
                        </span>
                      )}
                      <span className="text-xs opacity-50">
                        {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">{alert.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{alert.message}</p>

                    {alert.recommendation && (
                      <div className={`p-3 rounded-xl text-xs font-medium ${
                        darkMode ? 'bg-gray-700/60 text-blue-300' : 'bg-blue-50 text-blue-900'
                      } border border-blue-500/20 flex items-start gap-2 mt-2`}>
                        <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">AI Controller Recommendation:</strong>
                          {alert.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 w-full md:w-auto justify-end">
                  {alert.action_type === 'review_transaction' && (
                    <button
                      onClick={() => onReviewTransaction && onReviewTransaction(alert.action_payload)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                    >
                      Review Anomaly
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {alert.action_type === 'adjust_budget' && (
                    <button
                      onClick={() => onViewCategory && onViewCategory(alert.action_payload)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                    >
                      Adjust Budget
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {alert.action_type === 'view_category' && (
                    <button
                      onClick={() => onViewCategory && onViewCategory(alert.action_payload)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                    >
                      View Category
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDismissAlert && onDismissAlert(alert.id)}
                    className={`px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionCenter;
