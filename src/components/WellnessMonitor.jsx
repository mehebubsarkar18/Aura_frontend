import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Heart, ArrowLeft, Wind, Star, Sparkles, Trash2 } from 'lucide-react';

const EMOJIS = [
  { char: '😄', label: 'Great' },
  { char: '😊', label: 'Good' },
  { char: '😐', label: 'Okay' },
  { char: '😔', label: 'Low' },
  { char: '😠', label: 'Stressed' }
];

const WellnessMonitor = ({ onWellnessLogged, onViewHistory, initialViewHistory = false, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const [sleepHours, setSleepHours] = useState('');
  const [moodEmoji, setMoodEmoji] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWellnessHistory();
      const list = data.logs || [];
      list.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
      setLogs(list);
    } catch (err) {
      console.error('Wellness fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleLogWellness = async (e) => {
    e.preventDefault();
    if (!sleepHours || !moodEmoji) {
      alert('Please select both sleep duration and your mood.');
      return;
    }
    try {
      await api.logWellness({
        sleepDurationMin: Math.round(Number(sleepHours) * 60),
        sleepQuality: 'Restful',
        moodEmoji,
        moodNote: '',
        mindfulnessDurationMin: 0
      });
      setSleepHours('');
      setMoodEmoji(null);
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 3000);
      fetchHistory();
      if (onWellnessLogged) onWellnessLogged();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLog = async (log) => {
    const id = log._id || log.id || log.loggedAt;
    if (!id) {
      console.error('Missing ID for log:', log);
      return alert('Cannot delete: missing id');
    }
    if (!confirm('Delete this log? This action cannot be undone.')) return;
    try {
      // Optimistically remove from UI for snappy response
      setLogs(prev => prev.filter(l => (l._id || l.id || l.loggedAt) !== id));
      await api.deleteWellnessLog(id);
      // Re-sync with server to ensure consistency
      await fetchHistory();
    } catch (err) {
      console.error('Failed to delete', err);
      alert('Failed to delete log: ' + (err.message || 'Unknown error'));
      await fetchHistory();
    }
  };

  if (initialViewHistory) {
    return (
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Wellness History</h1>
        </div>

        <div className="glass-panel" style={{ padding: 16, background: 'var(--card-overlay)' }}>
          {!loading && logs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', opacity: 0.5 }}>
              <Heart size={40} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No wellness logs yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map((log) => {
                const logId = log._id || log.id || log.loggedAt;
                return (
                  <div key={logId} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, border: '1px solid var(--glass-card-border)', background: 'var(--card-overlay)', alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', background: 'var(--icon-bg)' }}>{log.moodEmoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{log.sleepDurationMin > 0 ? `${(Math.round(log.sleepDurationMin/6)/10)}h Sleep` : 'Mindfulness Session'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>{new Date(log.loggedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--color-violet)', fontWeight: 700, fontSize: '0.8rem' }}><Star size={10} />{log.sleepQuality}</div>
                        {log.mindfulnessDurationMin > 0 && <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--color-cyan)', fontWeight: 700, fontSize: '0.8rem' }}><Wind size={10} />{log.mindfulnessDurationMin}m</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mind & Body</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500, fontSize: '0.95rem' }}>Nurture your mental clarity and physical recovery</p>
        </div>
        <div />
      </div>

      <div className="wellness-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
        <style>{`@media (max-width: 1200px) { .wellness-grid { grid-template-columns: 1fr !important; } .wellness-left { grid-column: span 1 !important; } }`}</style>

        <div className="wellness-left" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20, position: 'relative', background: 'var(--card-overlay)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'rgba(168,85,247,0.15)', padding: 6, borderRadius: 8, color: 'var(--color-violet)' }}><Sparkles size={18} /></div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Daily Recovery</h2>
              <div style={{ marginLeft: 'auto' }}>
                <button type="button" onClick={onViewHistory || (() => setShowHistoryOverlay(true))} className="btn btn-history-violet" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>History</button>
              </div>
            </div>

            <form onSubmit={handleLogWellness} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sleep Duration</label>
                  <div style={{ fontWeight: 900, color: 'var(--color-violet)', fontSize: '1rem' }}>{sleepHours || 0} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>hours</span></div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[5,6,7,8,9,10].map(h => (
                    <button key={h} type="button" onClick={() => setSleepHours(h)} style={{ flex: '1 0 60px', padding: '6px 10px', borderRadius: '8px', background: Number(sleepHours) === h ? 'linear-gradient(135deg, var(--color-violet), #7c3aed)' : 'var(--input-bg)', border: '1px solid var(--glass-card-border)', color: Number(sleepHours) === h ? 'white' : 'var(--text-secondary)', fontWeight: 800, transition: 'all 0.2s', fontSize: '0.9rem' }}>{h}h</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>How are you feeling today?</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button key={e.char} type="button" onClick={() => setMoodEmoji(e.char)} style={{ flex: 1, minWidth: 70, padding: '8px 6px', borderRadius: 10, background: moodEmoji === e.char ? 'linear-gradient(135deg, var(--color-violet), #7c3aed)' : 'var(--input-bg)', border: '1px solid var(--glass-card-border)', color: moodEmoji === e.char ? 'white' : 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '1.4rem' }}>{e.char}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: moodEmoji === e.char ? 'white' : 'var(--text-secondary)' }}>{e.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <div style={{ minHeight: '24px' }}>
                  {logSuccess && <span style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} fill="var(--color-green)" /> Log added successfully!</span>}
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>Complete Log</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showHistoryOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 30, backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, padding: 20, border: '1px solid var(--glass-card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setShowHistoryOverlay(false)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Close</button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>Wellness History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!loading && logs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', opacity: 0.5 }}>
                  <Heart size={40} style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>No wellness logs yet.</div>
                </div>
              ) : (
                logs.map((log) => {
                  const logId = log._id || log.id || log.loggedAt;
                  return (
                    <div key={logId} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 12, border: '1px solid var(--glass-card-border)', background: 'var(--card-overlay)', alignItems: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', background: 'var(--icon-bg)' }}>{log.moodEmoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{log.sleepDurationMin > 0 ? `${(Math.round(log.sleepDurationMin/6)/10)}h Sleep` : 'Mindfulness Session'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>{new Date(log.loggedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--color-violet)', fontWeight: 800, fontSize: '0.8rem' }}><Star size={12} />{log.sleepQuality}</div>
                          {log.mindfulnessDurationMin > 0 && <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--color-cyan)', fontWeight: 800, fontSize: '0.8rem' }}><Wind size={12} />{log.mindfulnessDurationMin}m</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessMonitor;
