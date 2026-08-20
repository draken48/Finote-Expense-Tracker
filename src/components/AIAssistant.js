import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Database, ArrowRight, Bot, User 
} from 'lucide-react';
import { api } from '../api/client';

const SUGGESTED_QUESTIONS = [
  "How much did I spend on food this month?",
  "Am I going to exceed my budget?",
  "Why did my spending increase?",
  "Can I afford to spend ₹5,000 this weekend?",
  "Find unusual transactions",
  "What is my financial health score?",
  "What are my biggest expenses?"
];

const AIAssistant = ({
  expenses = [],
  currencySymbol = '₹',
  healthData,
  forecastData,
  darkMode,
  cardBg,
  borderColor
}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **Finote AI Finance Controller**. I have real-time access to your database, budgets, transaction history, and statistical forecasting models. Ask me any grounded question about your cash flow or spending limits.",
      citations: ["Grounded in active transaction database", "Statistical forecast active"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.sendAIChat({
        message: text,
        history: chatHistory
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.response,
        citations: response.citations || [],
        tool_calls: response.tool_calls_executed || [],
        suggested_followups: response.suggested_followups || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I encountered an error connecting to the controller services. Please ensure the backend is running.",
          citations: ["Network Error"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Finance Controller Copilot</h2>
            <p className="text-sm opacity-70">
              Deterministic tool execution grounded in your real financial data.
            </p>
          </div>
        </div>

        {/* Live Controller Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Tools Active</span>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              darkMode 
                ? 'bg-gray-800/80 border-gray-700 hover:border-blue-500 hover:bg-gray-700/80 text-gray-200' 
                : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 text-gray-700 shadow-sm'
            }`}
          >
            ✨ {q}
          </button>
        ))}
      </div>

      {/* Main Chat Container */}
      <div className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} overflow-hidden flex flex-col h-[600px]`}>
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4.5 space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : darkMode
                    ? 'bg-gray-800/90 border border-gray-700/60 text-gray-100'
                    : 'bg-gray-50 border border-gray-200/80 text-gray-800 shadow-sm'
                }`}
              >
                {/* Content */}
                <div className="text-sm leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none">
                  {msg.content}
                </div>

                {/* Citations & Tool Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-500/15">
                    {msg.citations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          msg.role === 'user'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}
                      >
                        <Database className="w-3 h-3" />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow up suggestions */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all flex items-center gap-1"
                      >
                        <span>{f}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'} flex items-center gap-2`}>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs opacity-60 ml-2">Calling financial tools & computing statistical forecast...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${borderColor} ${darkMode ? 'bg-gray-900/40' : 'bg-white'}`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a grounded question: 'Will I exceed budget?', 'How much spent on food?'..."
              disabled={loading}
              className={`flex-1 px-4 py-3.5 rounded-xl border ${borderColor} ${cardBg} text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
