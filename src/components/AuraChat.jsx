import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Bot, X, Send, Loader2, Dumbbell, Sparkles } from 'lucide-react';

const AuraChat = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hello! I'm Aura AI, your personal fitness coach. How can I help you level up your performance today?" }
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
      // Gather user context for the AI
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
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '110px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--aura-gradient)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--aura-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="chat-toggle-btn"
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--color-orange)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '900',
            border: '2px solid var(--bg-primary)'
          }}>
            AI
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '180px',
            right: '24px',
            width: 'min(400px, 90vw)',
            height: 'min(550px, 60vh)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--glass-card-border)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'var(--aura-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Aura AI <Sparkles size={14} />
              </div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: '600' }}>YOUR FITNESS COACH</div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '20px',
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
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: chat.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: chat.role === 'user' ? 'var(--aura-gradient)' : 'var(--card-overlay)',
                  color: chat.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  border: chat.role === 'user' ? 'none' : '1px solid var(--glass-card-border)',
                  fontWeight: chat.role === 'user' ? '600' : '500'
                }}
              >
                {chat.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--card-overlay)', padding: '12px', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--glass-card-border)' }}>
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-green)' }} />
              </div>
            )}
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '16px',
              borderTop: '1px solid var(--glass-card-border)',
              display: 'flex',
              gap: '10px'
            }}
          >
            <input 
              type="text"
              className="glass-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your progress..."
              style={{ flex: 1, height: '44px' }}
            />
            <button 
              type="submit"
              disabled={loading || !message.trim()}
              className="btn btn-primary"
              style={{ width: '44px', height: '44px', padding: 0, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AuraChat;
