import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Moon, Heart, Smile, Play, Square, Calendar, Activity } from 'lucide-react';

const EMOJIS = ['😄', '😐', '😔', '🥱', '😠'];

const WellnessMonitor = ({ onWellnessLogged }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States for Sleep & Mood
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('Restful');
  const [moodEmoji, setMoodEmoji] = useState('😄');
  const [moodNote, setMoodNote] = useState('');

  // Breathing Coach States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingState, setBreathingState] = useState('Get Ready');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const breathingIntervalRef = React.useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getWellnessHistory();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWellness = async (e) => {
    e.preventDefault();
    if (!sleepHours || !moodEmoji) return;

    try {
      const sleepMin = Math.round(Number(sleepHours) * 60);
      await api.logWellness({
        sleepDurationMin: sleepMin,
        sleepQuality,
        moodEmoji,
        moodNote,
        mindfulnessDurationMin: 0, // mindfulness tracked via the separate breathing timer
      });

      setSleepHours('');
      setSleepQuality('Restful');
      setMoodEmoji('😄');
      setMoodNote('');

      fetchHistory();
      onWellnessLogged();
    } catch (err) {
      alert('Failed to log wellness: ' + err.message);
    }
  };

  // Web Audio synth tones for breathing guide transitions
  const playBreathingBeep = (pitch = 440) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  // Breathing Coach Core Loop (Inhale 4s -> Hold 2s -> Exhale 4s)
  const startBreathing = () => {
    playBreathingBeep(523.25); // C5 Start
    setBreathingActive(true);
    setBreathingTimer(0);
    setBreathingState('Inhale...');
    
    let elapsed = 0;
    breathingIntervalRef.current = setInterval(() => {
      elapsed = (elapsed + 1) % 10;
      setBreathingTimer(prev => prev + 1);

      if (elapsed === 0) {
        setBreathingState('Inhale...');
        playBreathingBeep(523.25); // C5 Inhale
      } else if (elapsed === 4) {
        setBreathingState('Hold...');
        playBreathingBeep(587.33); // D5 Hold
      } else if (elapsed === 6) {
        setBreathingState('Exhale...');
        playBreathingBeep(392.00); // G4 Exhale
      }
    }, 1000);
  };

  const stopBreathing = async () => {
    playBreathingBeep(261.63); // C4 End
    clearInterval(breathingIntervalRef.current);
    setBreathingActive(false);
    setBreathingState('Get Ready');
    
    const minutesTracked = Math.round(breathingTimer / 60);

    if (minutesTracked >= 1) {
      try {
        // Commit breathing duration to database
        await api.logWellness({
          sleepDurationMin: 0,
          sleepQuality: 'Restful',
          moodEmoji: '😄',
          moodNote: 'Mindfulness Breathing Session',
          mindfulnessDurationMin: minutesTracked,
        });
        fetchHistory();
        onWellnessLogged();
      } catch (err) {
        console.error(err);
      }
    }
    setBreathingTimer(0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%' }}>
      
      {/* LEFT PORTION: SLEEP & MOOD LOGGER (7-COLUMNS) */}
      <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Sleep and mood form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Moon size={18} style={{ color: 'var(--color-violet)' }} />
            Log Sleep & Mood
          </h3>
          
          <form onSubmit={handleLogWellness} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sleep Duration (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  className="glass-input"
                  placeholder="e.g. 7.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sleep Quality</label>
                <select
                  className="glass-input"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  style={{ background: '#111827' }}
                >
                  <option>Restful</option>
                  <option>Light</option>
                  <option>Interrupted</option>
                </select>
              </div>
            </div>

            {/* Clickable Emoji Array */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>How is your mood today?</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMoodEmoji(emoji)}
                    className="glass-panel"
                    style={{
                      fontSize: '1.8rem',
                      padding: '10px 16px',
                      background: moodEmoji === emoji ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.02)',
                      borderColor: moodEmoji === emoji ? 'var(--color-violet)' : 'var(--glass-card-border)',
                      transition: 'all 0.2s ease',
                      flex: 1
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mood Note / Recovery Tags</label>
              <input
                type="text"
                className="glass-input"
                placeholder="Felt highly energized, ready for training!"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', background: 'linear-gradient(135deg, var(--color-violet), hsl(290, 85%, 55%))', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)', fontWeight: '700' }}>
              Record Log Entry
            </button>
          </form>
        </div>

        {/* History of logged sleep and wellness */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Wellness History</h3>
          {loading ? (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading history...</span>
          ) : logs.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No logs logged yet.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {logs.map((log, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '14px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{log.moodEmoji}</span>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {log.sleepDurationMin > 0 ? `${Math.round((log.sleepDurationMin / 60) * 10) / 10} hrs sleep` : 'Mindfulness Tracked'}
                      </span>
                      {log.sleepDurationMin > 0 && (
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          {log.sleepQuality}
                        </span>
                      )}
                    </div>
                    {log.moodNote && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{log.moodNote}</p>}
                    {log.mindfulnessDurationMin > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--color-violet)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Activity size={12} /> Guided Breathing: {log.mindfulnessDurationMin} min</span>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PORTION: GUIDED BREATHING COACH (5-COLUMNS) */}
      <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Animated breathing guide */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', minHeight: '400px', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Heart size={18} style={{ color: 'var(--color-violet)' }} />
              Breathing Companion
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Restore your recovery state</span>
          </div>

          {/* Glowing animated circle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', width: '220px', position: 'relative' }}>
            <div
              className={breathingActive ? 'breathing-orb' : ''}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.04) 70%)',
                border: '2px dashed var(--color-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                transition: 'all 0.5s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {breathingState}
              </span>
              {breathingActive && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
                  {Math.floor(breathingTimer / 60)}:String(breathingTimer % 60).padStart(2, '0')
                  {`${String(Math.floor(breathingTimer / 60)).padStart(2, '0')}:${String(breathingTimer % 60).padStart(2, '0')}`}
                </span>
              )}
            </div>
          </div>

          <div style={{ width: '100%' }}>
            {!breathingActive ? (
              <button
                onClick={startBreathing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, var(--color-violet), hsl(290, 85%, 55%))',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                }}
              >
                <Play size={16} fill="white" />
                Begin 4-2-4 Session
              </button>
            ) : (
              <button
                onClick={stopBreathing}
                className="btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontWeight: '700'
                }}
              >
                <Square size={14} fill="#f87171" />
                End & Record Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessMonitor;
