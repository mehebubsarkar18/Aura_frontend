import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import './App.css';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionHydration from './components/NutritionHydration';
import WellnessMonitor from './components/WellnessMonitor';
import { LayoutDashboard, Dumbbell, Droplet, Heart, LogOut, User as UserIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth and load initial aggregates
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileData = await api.getMe();
          setUser(profileData.user);
          
          // Fetch daily aggregates
          const summaryData = await api.getTodaySummary();
          setTodaySummary(summaryData.summary);
        } catch (err) {
          console.error('Session expired or connection failed:', err);
          api.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshSummary = async () => {
    if (!user) return;
    try {
      const data = await api.getTodaySummary();
      setTodaySummary(data.summary);
    } catch (err) {
      console.error('Failed to sync aggregates:', err);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    refreshSummary();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTodaySummary(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(253, 90, 32, 0.15)',
            borderTopColor: 'var(--color-orange)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <span style={{ fontWeight: '500', fontSize: '1.05rem' }}>Synchronizing Aura Connect...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return (
      <>
        {/* Floating Glowing Background Orbs */}
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <LoginRegister onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Floating Glowing Background Orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* SIDEBAR NAVIGATION (LEFT COL) */}
      <aside className="glass-panel" style={{
        width: '280px',
        margin: '24px 0 24px 24px',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '24px',
        flexShrink: 0,
        height: 'calc(100vh - 48px)',
        position: 'sticky',
        top: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Logo / Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(253, 90, 32, 0.25)'
            }} />
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em' }} className="text-gradient">
              AuraFit
            </h2>
          </div>

          {/* Active Navigation Menu */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                width: '100%',
                background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderColor: activeTab === 'dashboard' ? 'var(--color-orange)' : 'transparent',
                color: activeTab === 'dashboard' ? 'var(--color-orange)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'dashboard' ? '600' : '500',
                fontSize: '0.95rem',
                textAlign: 'left'
              }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('workouts')}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                width: '100%',
                background: activeTab === 'workouts' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderColor: activeTab === 'workouts' ? 'var(--color-orange)' : 'transparent',
                color: activeTab === 'workouts' ? 'var(--color-orange)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'workouts' ? '600' : '500',
                fontSize: '0.95rem',
                textAlign: 'left'
              }}
            >
              <Dumbbell size={20} />
              <span>Workouts</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                width: '100%',
                background: activeTab === 'nutrition' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderColor: activeTab === 'nutrition' ? 'var(--color-orange)' : 'transparent',
                color: activeTab === 'nutrition' ? 'var(--color-orange)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'nutrition' ? '600' : '500',
                fontSize: '0.95rem',
                textAlign: 'left'
              }}
            >
              <Droplet size={20} />
              <span>Nutrition</span>
            </button>

            <button
              onClick={() => setActiveTab('wellness')}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                width: '100%',
                background: activeTab === 'wellness' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderColor: activeTab === 'wellness' ? 'var(--color-orange)' : 'transparent',
                color: activeTab === 'wellness' ? 'var(--color-orange)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'wellness' ? '600' : '500',
                fontSize: '0.95rem',
                textAlign: 'left'
              }}
            >
              <Heart size={20} />
              <span>Wellness</span>
            </button>
          </nav>
        </div>

        {/* Profile / Logout Section at bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid var(--glass-card-border)',
            paddingTop: '20px',
            paddingLeft: '8px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-card-border)',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-secondary)'
            }}>
              <UserIcon size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{user.fullName}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}>{user.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="glass-panel"
            style={{
              padding: '12px 16px',
              color: '#f87171',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.08)'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* VIEWPORT CONTROLLER (RIGHT COL) */}
      <main className="main-content" style={{ padding: '40px', overflowY: 'auto', flex: 1, minHeight: '100vh' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            todaySummary={todaySummary}
            onGoalsUpdated={(updatedUser) => {
              setUser(updatedUser);
              refreshSummary();
            }}
          />
        )}
        {activeTab === 'workouts' && (
          <WorkoutTracker onWorkoutLogged={refreshSummary} />
        )}
        {activeTab === 'nutrition' && (
          <NutritionHydration user={user} onLogsUpdated={refreshSummary} />
        )}
        {activeTab === 'wellness' && (
          <WellnessMonitor onWellnessLogged={refreshSummary} />
        )}
      </main>
    </div>
  );
}

export default App;
