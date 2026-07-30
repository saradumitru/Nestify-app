import { useState } from 'react';
import api from '../services/api';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bună! Sunt asistentul Nestify. Descrie ce stil de interior cauți și te voi ajuta să găsești stilul perfect pentru tine!",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
const [conversationContext, setConversationContext] = useState([]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/assistant', {
        prompt: input,
        context: conversationContext,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: 'assistant',
        timestamp: new Date(),
        recommendations: response.data.recommendations,
        suggestions: response.data.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setRecommendations(response.data);
      setConversationContext((prev) => [...prev, userMessage, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Scuze, a apărut o eroare. Încearcă din nou.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition flex items-center justify-center z-40"
        title="Asistent AI"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-96 rounded-2xl bg-white shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-500 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Asistent Nestify</h3>
              <p className="text-sm text-emerald-100">Gata să ajut cu designul tău</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-emerald-100"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs">
                      {msg.recommendations.slice(0, 2).map((rec) => (
                        <p key={rec.id} className="font-semibold">
                          → {rec.title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descrie ce vrei..."
              className="flex-1 px-3 py-2 rounded-full border border-slate-300 focus:outline-none focus:border-emerald-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              Trimite
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
