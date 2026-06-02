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

  

  const [sleepHours, setSleepHours] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('😄');

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
    if (!sleepHours) return;
    try {
      await api.logWellness({
        sleepDurationMin: Math.round(Number(sleepHours) * 60),
        sleepQuality: 'Restful',
        moodEmoji,
        moodNote: '',
        mindfulnessDurationMin: 0
      });
      setSleepHours('');
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
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Wellness History</h1>
        </div>

        <div className="glass-panel" style={{ padding: 24, background: 'var(--card-overlay)' }}>
          {!loading && logs.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', opacity: 0.5 }}>
              <Heart size={56} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600 }}>No wellness logs yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {logs.map((log) => {
                const logId = log._id || log.id || log.loggedAt;
                return (
                  <div key={logId} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 14, border: '1px solid var(--glass-card-border)', background: 'var(--card-overlay)', alignItems: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--icon-bg)' }}>{log.moodEmoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{log.sleepDurationMin > 0 ? `${(Math.round(log.sleepDurationMin/6)/10)}h Sleep` : 'Mindfulness Session'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>{new Date(log.loggedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-violet)', fontWeight: 700 }}><Star size={14} />{log.sleepQuality}</div>
                        {log.mindfulnessDurationMin > 0 && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-cyan)', fontWeight: 700 }}><Wind size={14} />{log.mindfulnessDurationMin}m</div>}
                      </div>
                    </div>
                    {/* delete option removed */}
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
    <div className="wellness-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800 }}>Mind & Body</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>Nurture your mental clarity and physical recovery</p>
        </div>
        <div />
      </div>

      <div className="wellness-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
        <style>{`@media (max-width: 1200px) { .wellness-grid { grid-template-columns: 1fr !important; } .wellness-left { grid-column: span 1 !important; } }`}</style>

        <div className="wellness-left" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-panel" style={{ padding: 32, position: 'relative', background: 'var(--card-overlay)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ background: 'rgba(168,85,247,0.15)', padding: 10, borderRadius: 12, color: 'var(--color-violet)' }}><Sparkles size={24} /></div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Daily Recovery</h2>
              <div style={{ marginLeft: 'auto' }}>
                <button type="button" onClick={onViewHistory || (() => setShowHistoryOverlay(true))} className="btn btn-violet">History</button>
              </div>
            </div>

            <form onSubmit={handleLogWellness} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sleep Duration</label>
                  <div style={{ fontWeight: 900, color: 'var(--color-violet)', fontSize: '1.2rem' }}>{sleepHours || 0} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>hours</span></div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[5,6,7,8,9,10].map(h => (
                    <button key={h} type="button" onClick={() => setSleepHours(h)} style={{ flex: '1 0 80px', padding: 14, borderRadius: 12, background: Number(sleepHours) === h ? 'linear-gradient(135deg, var(--color-violet), #7c3aed)' : 'var(--input-bg)', border: '1px solid var(--glass-card-border)', color: Number(sleepHours) === h ? 'white' : 'var(--text-secondary)', fontWeight: 800, transition: 'all 0.2s', fontSize: '1.1rem' }}>{h}h</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '1rem', fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>How are you feeling today?</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button key={e.char} type="button" onClick={() => setMoodEmoji(e.char)} style={{ flex: 1, minWidth: 100, padding: 16, borderRadius: 14, background: moodEmoji === e.char ? 'rgba(168,85,247,0.12)' : 'var(--input-bg)', border: '1px solid var(--glass-card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '2rem' }}>{e.char}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: moodEmoji === e.char ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{e.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '16px 32px' }}>Complete Log</button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ gridColumn: 'span 5' }} />
      </div>
      {showHistoryOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 1100, maxHeight: '92vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 20, padding: 32, border: '1px solid var(--glass-card-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <button onClick={() => setShowHistoryOverlay(false)} className="btn btn-ghost" style={{ padding: '10px 20px' }}>Close</button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>Wellness History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!loading && logs.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', opacity: 0.5 }}>
                  <Heart size={64} style={{ margin: '0 auto 16px' }} />
                  <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>No wellness logs yet.</div>
                </div>
              ) : (
                logs.map((log) => {
                  const logId = log._id || log.id || log.loggedAt;
                  return (
                    <div key={logId} style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 16, border: '1px solid var(--glass-card-border)', background: 'var(--card-overlay)', alignItems: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'var(--icon-bg)' }}>{log.moodEmoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{log.sleepDurationMin > 0 ? `${(Math.round(log.sleepDurationMin/6)/10)}h Sleep` : 'Mindfulness Session'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 700 }}>{new Date(log.loggedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-violet)', fontWeight: 800 }}><Star size={16} />{log.sleepQuality}</div>
                          {log.mindfulnessDurationMin > 0 && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-cyan)', fontWeight: 800 }}><Wind size={16} />{log.mindfulnessDurationMin}m</div>}
                        </div>
                      </div>
                      {/* delete option removed */}
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
