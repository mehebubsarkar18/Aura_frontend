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
      padding: '24px',
      position: 'relative',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel auth-card" style={{
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        borderRadius: '32px'
      }}>
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="btn btn-ghost btn-icon"
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 10
          }}
          title="Back to Home"
        >
          <ArrowLeft size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(253, 90, 32, 0.3)'
          }}>
            <Dumbbell size={24} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-gradient auth-title" style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '10px' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
            {isLogin ? 'Enter your credentials to continue your journey' : 'Create your AuraFit account to start tracking'}
          </p>
        </div>

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '14px',
            padding: '14px 20px',
            marginBottom: '32px',
            color: '#4ade80',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            <Dumbbell size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '14px',
            padding: '14px 20px',
            marginBottom: '32px',
            color: '#f87171',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  style={{ width: '100%', paddingLeft: '52px', minHeight: '54px' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="glass-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '52px', minHeight: '54px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '52px', minHeight: '54px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '16px',
              fontSize: '1.1rem',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(253, 90, 32, 0.25)'
            }}
          >
            {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
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
