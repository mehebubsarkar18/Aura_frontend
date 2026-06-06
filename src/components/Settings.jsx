import { useState } from 'react';
import { api } from '../utils/api';
import { Lock, LogOut, Target, User, Eye, EyeOff } from 'lucide-react';

const Settings = ({ user, onGoalsUpdated, onLogout }) => {
  const [caloriesGoal, setCaloriesGoal] = useState(user.dailyGoals.calories);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState(user.dailyGoals.activeMinutes || 45);
  const [waterGoal, setWaterGoal] = useState(user.dailyGoals.waterMl);
  const [sleepGoal, setSleepGoal] = useState(user.dailyGoals.sleepMinutes);
  const [savingGoals, setSavingGoals] = useState(false);

  // New Profile States
  const [weight, setWeight] = useState(user.weight || '');
  const [height, setHeight] = useState(user.height || '');
  const [age, setAge] = useState(user.age || '');
  const [gender, setGender] = useState(user.gender || 'male');
  const [fitnessGoal, setFitnessGoal] = useState(user.fitnessGoal || 'maintain-fit');
  const [savingProfile, setSavingProfile] = useState(false);

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
      const data = await api.updateProfile({
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
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
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', margin: 0, alignItems: 'stretch', padding: '24px' }}>
      <h1 className="text-gradient page-title">Settings</h1>

      {/* Personal Identity Card (Non-editable) */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(253, 90, 32, 0.1)', padding: '14px', borderRadius: '16px', color: 'var(--color-orange)' }}>
            <User size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Personal Identity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '4px' }}>Permanent account and identity details</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Full Name</label>
            <input type="text" className="glass-input" value={user.fullName} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Email Address</label>
            <input type="text" className="glass-input" value={user.email} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Age</label>
            <input type="number" className="glass-input" value={user.age} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Gender</label>
            <input type="text" className="glass-input" value={user.gender} readOnly style={{ opacity: 0.8, cursor: 'not-allowed', padding: '14px 18px', textTransform: 'capitalize' }} />
          </div>
        </div>
      </section>

      {/* Biometrics & Goals Card (Editable) */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '14px', borderRadius: '16px', color: 'var(--color-cyan)' }}>
            <Target size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Biometrics & Goals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '4px' }}>Update your measurements and fitness objectives</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Weight (kg)</label>
            <input type="number" className="glass-input" value={weight} onChange={e => setWeight(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Height (cm)</label>
            <input type="number" className="glass-input" value={height} onChange={e => setHeight(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Fitness Goal</label>
            <select 
              className="glass-input" 
              value={fitnessGoal} 
              onChange={e => setFitnessGoal(e.target.value)} 
              style={{ padding: '14px 18px', appearance: 'none', background: 'var(--input-bg)' }}
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
            fontSize: '1.1rem',
            fontWeight: '900'
          }}
        >
          <User size={22} /> {savingProfile ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
      </section>

      {/* Daily Goals Section */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '14px', borderRadius: '16px', color: 'var(--color-cyan)' }}>
            <Target size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Daily Health Goals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '4px' }}>Set your daily targets for activity and nutrition</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Calories (kcal)</label>
            <input type="number" className="glass-input" value={caloriesGoal} onChange={e => setCaloriesGoal(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Workouts</label>
            <input type="number" className="glass-input" value={activeMinutesGoal} onChange={e => setActiveMinutesGoal(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Water (mL)</label>
            <input type="number" className="glass-input" value={waterGoal} onChange={e => setWaterGoal(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', paddingLeft: '4px' }}>Sleep (min)</label>
            <input type="number" className="glass-input" value={sleepGoal} onChange={e => setSleepGoal(e.target.value)} style={{ padding: '14px 18px' }} />
          </div>
        </div>
        <button 
          onClick={handleSaveGoals} 
          disabled={savingGoals} 
          className="btn btn-cyan" 
          style={{ 
            alignSelf: 'flex-end', 
            fontSize: '1.1rem',
            fontWeight: '900'
          }}
        >
          <Target size={22} /> {savingGoals ? 'SAVING...' : 'UPDATE GOALS'}
        </button>
      </section>


      {/* Security Section */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '14px', borderRadius: '16px', color: 'var(--color-violet)' }}>
            <Lock size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '4px' }}>Update your password and secure your account</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', alignItems: 'stretch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                className="glass-input" 
                placeholder="Current Password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ padding: '14px 48px 14px 18px', fontSize: '1rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                style={{ padding: '14px 48px 14px 18px', fontSize: '1rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                style={{ padding: '14px 48px 14px 18px', fontSize: '1rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {passwordStatus.message && (
            <div style={{ 
              fontSize: '1rem', 
              color: passwordStatus.type === 'error' ? '#f87171' : 'var(--color-green)', 
              padding: '16px 20px',
              background: passwordStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
              borderRadius: '16px',
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
              fontSize: '1.1rem',
              fontWeight: '900'
            }}
          >
            {changingPassword ? 'UPDATING...' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </section>

      {/* Logout Section */}
      <section className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f87171' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '6px' }}>Signing out will end your session on this device</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={onLogout} 
              className="btn btn-red" 
              style={{ 
                borderRadius: '20px',
                fontWeight: '900',
                fontSize: '1.1rem'
              }}
            >
              <LogOut size={24} /> SIGN OUT
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Settings;