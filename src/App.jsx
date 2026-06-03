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
import { LayoutDashboard, Dumbbell, Droplet, Heart, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('landing');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileData = await api.getMe();
          setUser(profileData.user);
          // Keep authView as 'landing' to show prelogin page first
        } catch (error) {
          console.error('Auth initialization failed', error);
          api.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

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
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))', 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserIcon size={18} color="var(--text-secondary)" />
        </div>
      </header>

      <aside className="glass-panel app-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="brand-lockup" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px', marginBottom: '40px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))', 
              width: '32px', 
              height: '32px', 
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={18} color="white" strokeWidth={2.5} />
            </div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem' }}>AuraFit</h2>
          </div>
          <nav className="app-nav" style={{ flex: 1, marginTop: 0 }}>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
              { id: 'nutrition', icon: Droplet, label: 'Nutrition' },
              { id: 'wellness', icon: Heart, label: 'Wellness' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`nav-button ${activeTab === id ? 'active' : ''}`}>
                <Icon size={20} /> <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="bottom-nav">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'workouts', icon: Dumbbell },
          { id: 'nutrition', icon: Droplet },
          { id: 'wellness', icon: Heart },
          { id: 'settings', icon: SettingsIcon }
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
        
        {activeTab === 'settings' && <Settings user={user} onGoalsUpdated={(u) => { setUser(u); refreshSummary(); }} onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;
