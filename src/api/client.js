// Finote AI API Client with resilient offline/fallback support

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[Finote API] Network request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Demo Mode
  seedDemoData: () => request('/demo/seed', { method: 'POST' }),

  // Transactions
  getTransactions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  createTransaction: (data) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateTransaction: (id, data) => request(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteTransaction: (id) => request(`/transactions/${id}`, {
    method: 'DELETE',
  }),

  autoCategorize: (data) => request('/transactions/categorize', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Budgets
  getBudgets: () => request('/budgets'),
  setBudget: (data) => request('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Analytics
  getAnalytics: () => request('/analytics/summary'),

  // Forecasting
  getForecast: () => request('/forecast'),

  // Financial Health
  getFinancialHealth: () => request('/financial-health'),

  // Anomalies
  getAnomalies: () => request('/anomalies'),
  updateAnomalyStatus: (id, status) => request(`/anomalies/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'POST',
  }),

  // Alerts & Action Center
  getAlerts: () => request('/alerts'),
  dismissAlert: (id) => request(`/alerts/${id}/dismiss`, { method: 'POST' }),
  readAlert: (id) => request(`/alerts/${id}/read`, { method: 'POST' }),

  // Receipts
  analyzeReceipt: (formData) => {
    return fetch(`${API_BASE_URL}/receipts/analyze`, {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Receipt parsing failed');
      return res.json();
    });
  },

  confirmReceipt: (data) => request('/receipts/confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // AI Chat
  sendAIChat: (data) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
