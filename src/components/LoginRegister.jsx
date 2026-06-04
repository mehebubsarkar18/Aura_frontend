import { useState } from 'react';
import { api } from '../utils/api';
import { Lock, Mail, User, ShieldAlert, ArrowLeft, Dumbbell } from 'lucide-react';

const LoginRegister = ({ onAuthSuccess, onBack, initialIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onAuthSuccess(data.user);
      } else {
        await api.register(fullName, email, password);
        // On signup success, clear fields and switch to login
        setIsLogin(true);
        setFullName('');
        setPassword('');
        setSuccessMessage('Account created successfully! Please sign in with your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      position: 'relative',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel auth-card" style={{
        padding: '32px 24px',
        maxWidth: '420px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px'
      }}>
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="btn btn-ghost btn-icon"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            padding: '8px'
          }}
          title="Back to Home"
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'var(--aura-gradient)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--aura-glow)'
          }}>
            <Dumbbell size={20} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-gradient auth-title" style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {isLogin ? 'Enter your credentials to continue your journey' : 'Create your AuraFit account to start tracking'}
          </p>
        </div>

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#4ade80',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            <Dumbbell size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#f87171',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  style={{ width: '100%', paddingLeft: '44px', minHeight: '48px', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="glass-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '44px', minHeight: '48px', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '44px', minHeight: '48px', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
            style={{
              padding: '12px',
              fontSize: '0.95rem',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(253, 90, 32, 0.25)'
            }}
          >
            {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} className="auth-toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="auth-toggle-link"
              style={{
                color: 'var(--color-orange)',
                cursor: 'pointer',
                fontWeight: '700',
                marginLeft: '4px'
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
