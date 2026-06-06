import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Lock, LogOut, Target, User, Eye, EyeOff, Ruler } from 'lucide-react';

const Settings = ({ user, onGoalsUpdated, onLogout }) => {
  const [caloriesGoal, setCaloriesGoal] = useState(user.dailyGoals.calories);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState(user.dailyGoals.activeMinutes || 45);
  const [waterGoal, setWaterGoal] = useState(user.dailyGoals.waterMl);
  const [sleepGoal, setSleepGoal] = useState(user.dailyGoals.sleepMinutes);
  const [savingGoals, setSavingGoals] = useState(false);

  // New Profile States
  const [weight, setWeight] = useState(user.weight || '');
  const [heightMode, setHeightMode] = useState('ft'); // Default to 'ft'
  const [heightCm, setHeightCm] = useState(user.height || '');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState(user.fitnessGoal || 'maintain-fit');
  const [savingProfile, setSavingProfile] = useState(false);

  // Initialize ft/in from cm if available
  useEffect(() => {
    if (user.height) {
      const totalInches = user.height / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFt(ft);
      setHeightIn(inches);
    }
  }, [user.height]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      let finalHeight = Number(heightCm);
      if (heightMode === 'ft') {
        finalHeight = (Number(heightFt) * 30.48) + (Number(heightIn) * 2.54);
      }

      const data = await api.updateProfile({
        weight: Number(weight),
        height: Math.round(finalHeight * 10) / 10,
        fitnessGoal
      });
      
      // Update local goal states since backend recalculates them
      setCaloriesGoal(data.user.dailyGoals.calories);
      setWaterGoal(data.user.dailyGoals.waterMl);
      
      onGoalsUpdated(data.user);
      alert('Profile updated and goals recalculated!');
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    try {
      const data = await api.updateGoals({
        calories: Number(caloriesGoal),
        activeMinutes: Number(activeMinutesGoal),
        waterMl: Number(waterGoal),
        sleepMinutes: Number(sleepGoal),
      });
      onGoalsUpdated(data.user);
      alert('Goals updated successfully!');
    } catch (err) {
      alert('Failed to save goals: ' + err.message);
    } finally {
      setSavingGoals(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setChangingPassword(true);
    setPasswordStatus({ type: '', message: '' });
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', margin: 0, alignItems: 'stretch', padding: '12px' }}>
      <h1 className="text-gradient page-title" style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Settings</h1>

      {/* Personal Identity Card (Non-editable) */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(253, 90, 32, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--color-orange)' }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Personal Identity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1px' }}>Permanent account details</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Full Name</label>
            <input type="text" className="glass-input" value={user.fullName} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Email Address</label>
            <input type="text" className="glass-input" value={user.email} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
        </div>
      </section>

      {/* Biometrics & Goals Card (Editable) */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--color-cyan)' }}>
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Biometrics & Goals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1px' }}>Measurements and fitness objectives</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Weight (kg)</label>
            <input type="number" className="glass-input" value={weight} onChange={e => setWeight(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '2px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Height</label>
              <div style={{ display: 'flex', background: 'var(--icon-bg)', borderRadius: '5px', padding: '1px' }}>
                <button 
                  onClick={() => setHeightMode('ft')} 
                  style={{ 
                    padding: '1px 6px', fontSize: '0.65rem', borderRadius: '3px', border: 'none', cursor: 'pointer',
                    background: heightMode === 'ft' ? 'var(--color-cyan)' : 'transparent',
                    color: heightMode === 'ft' ? '#000' : 'var(--text-secondary)',
                    fontWeight: '700'
                  }}
                >FT+IN</button>
                <button 
                  onClick={() => setHeightMode('cm')} 
                  style={{ 
                    padding: '1px 6px', fontSize: '0.65rem', borderRadius: '3px', border: 'none', cursor: 'pointer',
                    background: heightMode === 'cm' ? 'var(--color-cyan)' : 'transparent',
                    color: heightMode === 'cm' ? '#000' : 'var(--text-secondary)',
                    fontWeight: '700'
                  }}
                >CM</button>
              </div>
            </div>
            
            {heightMode === 'cm' ? (
              <input type="number" className="glass-input" placeholder="cm" value={heightCm} onChange={e => setHeightCm(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <input type="number" className="glass-input" placeholder="ft" value={heightFt} onChange={e => setHeightFt(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                <input type="number" className="glass-input" placeholder="in" value={heightIn} onChange={e => setHeightIn(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Fitness Goal</label>
            <select 
              className="glass-input" 
              value={fitnessGoal} 
              onChange={e => setFitnessGoal(e.target.value)} 
              style={{ padding: '8px 12px', appearance: 'none', background: 'var(--input-bg)', fontSize: '0.85rem' }}
            >
              <option value="lose-weight">Lose Weight</option>
              <option value="maintain-fit">Stay Fit</option>
              <option value="gain-muscle">Gain Muscle</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleUpdateProfile} 
          disabled={savingProfile} 
          className="btn btn-orange" 
          style={{ 
            alignSelf: 'flex-end', 
            fontSize: '0.9rem',
            fontWeight: '900',
            padding: '8px 16px'
          }}
        >
          <User size={16} /> {savingProfile ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
      </section>

      {/* Daily Goals Section */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--color-cyan)' }}>
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Daily Health Goals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1px' }}>Targets for activity and nutrition</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Calories (kcal)</label>
            <input type="number" className="glass-input" value={caloriesGoal} onChange={e => setCaloriesGoal(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Workouts</label>
            <input type="number" className="glass-input" value={activeMinutesGoal} onChange={e => setActiveMinutesGoal(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Water (mL)</label>
            <input type="number" className="glass-input" value={waterGoal} onChange={e => setWaterGoal(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '2px' }}>Sleep (min)</label>
            <input type="number" className="glass-input" value={sleepGoal} onChange={e => setSleepGoal(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
          </div>
        </div>
        <button 
          onClick={handleSaveGoals} 
          disabled={savingGoals} 
          className="btn btn-cyan" 
          style={{ 
            alignSelf: 'flex-end', 
            fontSize: '0.9rem',
            fontWeight: '900',
            padding: '8px 16px'
          }}
        >
          <Target size={16} /> {savingGoals ? 'SAVING...' : 'UPDATE GOALS'}
        </button>
      </section>

      {/* Security Section */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--color-violet)' }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1px' }}>Account security details</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'stretch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                className="glass-input" 
                placeholder="Current Password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ padding: '8px 32px 8px 12px', fontSize: '0.85rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}
              >
                {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showNewPassword ? "text" : "password"} 
                className="glass-input" 
                placeholder="New Password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ padding: '8px 32px 8px 12px', fontSize: '0.85rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="glass-input" 
                placeholder="Confirm New Password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '8px 32px 8px 12px', fontSize: '0.85rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {passwordStatus.message && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: passwordStatus.type === 'error' ? '#f87171' : 'var(--color-green)', 
              padding: '10px 14px',
              background: passwordStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
              borderRadius: '10px',
              fontWeight: '700'
            }}>
              {passwordStatus.message}
            </div>
          )}
          <button 
            type="submit" 
            disabled={changingPassword} 
            className="btn btn-violet"
            style={{ 
              alignSelf: 'flex-end',
              fontSize: '0.9rem',
              fontWeight: '900',
              padding: '8px 16px'
            }}
          >
            {changingPassword ? 'UPDATING...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </section>

      {/* Logout Section */}
      <section className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f87171' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Sign out of your session</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={onLogout} 
              className="btn btn-red" 
              style={{ 
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.9rem',
                padding: '8px 16px'
              }}
            >
              <LogOut size={16} /> SIGN OUT
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Settings;
