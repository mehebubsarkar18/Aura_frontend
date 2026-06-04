import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const AuraChat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: `Hello ${user?.fullName || 'there'}! I'm AuraAI, your personal fitness coach. How can I help you level up your performance today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);

    try {
      const userContext = {
        name: user?.fullName,
        age: user?.age,
        weight: user?.weight,
        height: user?.height,
        goals: user?.dailyGoals
      };

      const res = await api.askAI(userMessage, userContext);
      if (res.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: res.reply }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'ai', text: "I'm having a bit of a connection issue. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-page" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient page-title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>AuraAI Coach</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>Your personalized performance assistant</p>
        </div>
      </div>

      <div 
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--glass-card-border)',
          boxShadow: 'var(--shadow-main)',
          background: 'var(--glass-card-bg)',
          borderRadius: '24px'
        }}
      >
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {chatHistory.map((chat, i) => (
            <div 
              key={i} 
              style={{
                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: 'min(500px, 85%)',
                padding: '14px 20px',
                borderRadius: chat.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: chat.role === 'user' ? 'var(--aura-gradient)' : 'var(--card-overlay)',
                color: chat.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '1rem',
                lineHeight: '1.6',
                border: chat.role === 'user' ? 'none' : '1px solid var(--glass-card-border)',
                fontWeight: chat.role === 'user' ? '600' : '500',
                boxShadow: chat.role === 'user' ? 'var(--aura-glow)' : 'none'
              }}
            >
              {chat.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--card-overlay)', padding: '14px 20px', borderRadius: '20px 20px 20px 4px', border: '1px solid var(--glass-card-border)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-green)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>AuraAI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSend}
          style={{
            padding: '24px',
            borderTop: '1px solid var(--glass-card-border)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(0,0,0,0.02)'
          }}
        >
          <input 
            type="text"
            className="glass-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question here (e.g. 'Give me a 10 min HIIT plan')"
            style={{ 
              flex: 1, 
              height: '56px', 
              fontSize: '1rem',
              padding: '0 24px',
              borderRadius: '16px'
            }}
          />
          <button 
            type="submit"
            disabled={loading || !message.trim()}
            className="btn btn-primary"
            style={{ width: '56px', height: '56px', padding: 0, flexShrink: 0, borderRadius: '16px' }}
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuraChat;
