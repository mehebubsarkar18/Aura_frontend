import { useState, useEffect } from 'react';
import { api } from './utils/api';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginRegister from './components/LoginRegister';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionHydration from './components/NutritionHydration';
import WellnessMonitor from './components/WellnessMonitor';
import Settings from './components/Settings';
import AuraChat from './components/AuraChat';
import { LayoutDashboard, Dumbbell, Droplet, Heart, User as UserIcon, Settings as SettingsIcon, Bot, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const cached = api.getCached('user_me');
    return cached ? cached.user : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(!user && !!localStorage.getItem('token'));
  const [authView, setAuthView] = useState('landing');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch fresh profile in background
          const profileData = await api.getMe(false);
          setUser(profileData.user);
          setAuthView(null);
        } catch (error) {
          console.error('Auth initialization failed', error);
          // Only logout if we don't have a user at all (even cached)
          const cached = api.getCached('user_me');
          if (!cached) api.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []); // Only run once on mount

  const refreshSummary = async () => {
    // This is now handled by components internally if needed, 
    // but kept here for profile updates or simple refreshes if shared state exists.
    if (!user) return;
    try {
      const profileData = await api.getMe();
      setUser(profileData.user);
    } catch (error) {
      console.error('Refresh failed', error);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    localStorage.removeItem('aura_workout_session');
    setUser(authenticatedUser);
    setAuthView(null);
  };

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('aura_workout_session');
    setUser(null);
    setActiveTab('dashboard');
    setAuthView('landing');
  };

  if (loading) {
    return (
      <div className="app-loading-container" style={{ background: 'var(--bg-primary)', height: '100vh' }}>
        <div className="aura-pulse">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="loading-text">LOADING YOUR AURA</div>
      </div>
    );
  }

  if (authView === 'landing') {
    return (
      <LandingPage 
        user={user}
        onGetStarted={() => setAuthView('register')} 
        onLogin={() => setAuthView('login')} 
      />
    );
  }

  if (!user) {
    return <LoginRegister onAuthSuccess={handleAuthSuccess} onBack={() => setAuthView('landing')} initialIsLogin={authView === 'login'} />;
  }
  
  if (!user.onboardingCompleted) return <ProfileSetup onSetupComplete={(u) => { setUser(u); }} />;

  return (
    <div className="app-container">
      <aside className="glass-panel app-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="brand-lockup" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px', marginBottom: '48px' }}>
            <div style={{ 
              background: 'var(--aura-gradient)', 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--aura-glow)'
            }}>
              <Dumbbell size={20} color="white" strokeWidth={2.5} />
            </div>
            <h2 className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: '800' }}>AuraFit</h2>
          </div>
          
          <nav className="app-nav" style={{ flex: 1 }}>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
              { id: 'nutrition', icon: Droplet, label: 'Nutrition' },
              { id: 'wellness', icon: Heart, label: 'Wellness' },
              { id: 'aura-ai', icon: Bot, label: 'AuraAI' }
            ].map(({ id, icon: Icon, label }) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id)} 
                className={`nav-button ${activeTab === id ? 'active' : ''}`}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={20} />
                </div>
                <span>{label}</span>
              </button>
            ))}
          </nav>
          
          <div style={{ marginTop: 'auto' }}>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
              style={{ marginBottom: '12px' }}
            >
              <div className="nav-icon-wrapper">
                <UserIcon size={20} />
              </div>
              <span>Profile</span>
            </button>
            <button className="nav-button logout-btn" onClick={handleLogout} style={{ color: '#f87171' }}>
              <div className="nav-icon-wrapper">
                <LogOut size={20} />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="app-header">
          <div className="mobile-brand-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              background: 'var(--aura-gradient)', 
              width: '28px', 
              height: '28px', 
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={16} color="white" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }} className="text-gradient">AuraFit</h2>
          </div>
          
          <div 
            className="mobile-profile-btn"
            onClick={() => setActiveTab('settings')}
          >
            <UserIcon size={20} />
          </div>
        </header>

        {/* Floating Bottom Nav for Mobile */}
        <nav className="bottom-nav">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'workouts', icon: Dumbbell },
            { id: 'nutrition', icon: Droplet },
            { id: 'wellness', icon: Heart },
            { id: 'aura-ai', icon: Bot }
          ].map(({ id, icon: Icon }) => (
            <button 
              key={id} 
              onClick={() => setActiveTab(id)} 
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={28} strokeWidth={3.5} />
            </button>
          ))}
        </nav>

        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard user={user} />}
          
          {activeTab === 'workouts' && <WorkoutTracker onWorkoutLogged={refreshSummary} onViewHistory={() => setActiveTab('workout-history')} />}
          {activeTab === 'workout-history' && <WorkoutTracker initialViewHistory={true} onBack={() => setActiveTab('workouts')} />}
          
          {activeTab === 'nutrition' && <NutritionHydration user={user} onLogsUpdated={refreshSummary} onViewHistory={() => setActiveTab('nutrition-history')} />}
          {activeTab === 'nutrition-history' && <NutritionHydration user={user} initialViewHistory={true} onBack={() => setActiveTab('nutrition')} />}
          
          {activeTab === 'wellness' && <WellnessMonitor onWellnessLogged={refreshSummary} onViewHistory={() => setActiveTab('wellness-history')} />}
          {activeTab === 'wellness-history' && <WellnessMonitor initialViewHistory={true} onBack={() => setActiveTab('wellness')} />}
          
          {activeTab === 'aura-ai' && <AuraChat user={user} />}
          
          {activeTab === 'settings' && <Settings user={user} onGoalsUpdated={(u) => { setUser(u); refreshSummary(); }} onLogout={handleLogout} />}
        </main>
      </div>
    </div>
  );
}

export default App;
