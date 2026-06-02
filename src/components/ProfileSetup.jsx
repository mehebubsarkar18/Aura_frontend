import { useState } from 'react';
import { api } from '../utils/api';
import { ChevronRight, Dumbbell } from 'lucide-react';

const ProfileSetup = ({ onSetupComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    fitnessGoal: 'maintain-fit'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for clearing input, otherwise keep it as string to allow typing decimals
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation before proceeding
    if (step === 1 && (!formData.age || formData.age <= 0)) return;
    if (step === 2 && (!formData.weight || !formData.height)) return;

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0); // Scroll to top for next step animation
      return;
    }

    setLoading(true);
    try {
      const response = await api.completeOnboarding({
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
        gender: formData.gender,
        fitnessGoal: formData.fitnessGoal
      });
      onSetupComplete(response.user);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel auth-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))', 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Dumbbell size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'white' }}>AuraFit</span>
        </div>

        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? 'var(--color-orange)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.4s ease'
            }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div style={{ animation: 'slide-in 0.4s ease-out' }}>
              <h2 className="auth-title text-gradient" style={{ marginBottom: '10px' }}>Let's get to know you</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>We need a few details to calculate your personalized fitness targets.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Your Gender</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`btn ${formData.gender === g ? 'btn-orange' : 'btn-ghost'}`}
                        style={{
                          textTransform: 'capitalize'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 25"
                    className="glass-input"
                    value={formData.age}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    required
                    min="1"
                    max="120"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'slide-in 0.4s ease-out' }}>
              <h2 className="auth-title text-gradient" style={{ marginBottom: '10px' }}>Your Measurements</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>These help us determine your base metabolic rate.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="e.g. 70.5"
                    step="any"
                    inputMode="decimal"
                    className="glass-input"
                    value={formData.weight}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    required
                    min="20"
                    max="300"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    placeholder="e.g. 175"
                    step="any"
                    inputMode="decimal"
                    className="glass-input"
                    value={formData.height}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    required
                    min="50"
                    max="250"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'slide-in 0.4s ease-out' }}>
              <h2 className="auth-title text-gradient" style={{ marginBottom: '10px' }}>Set Your Goal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.95rem' }}>What are you looking to achieve with AuraFit?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'lose-weight', label: 'Lose Weight', desc: 'Burn fat and get leaner' },
                  { id: 'maintain-fit', label: 'Stay Fit', desc: 'Keep your current physique' },
                  { id: 'gain-muscle', label: 'Gain Muscle', desc: 'Build strength and size' }
                ].map(g => (
                  <div
                    key={g.id}
                    onClick={() => setFormData({ ...formData, fitnessGoal: g.id })}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: formData.fitnessGoal === g.id ? '2px solid var(--color-orange)' : '1px solid var(--glass-card-border)',
                      background: formData.fitnessGoal === g.id ? 'rgba(253, 90, 32, 0.05)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: formData.fitnessGoal === g.id ? 'var(--color-orange)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {formData.fitnessGoal === g.id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-orange)' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: formData.fitnessGoal === g.id ? '#fff' : 'var(--text-primary)' }}>{g.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '700'
              }}
            >
              {loading ? 'Calculating...' : (step === 3 ? 'Complete Setup' : 'Continue')}
              {step < 3 && <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
