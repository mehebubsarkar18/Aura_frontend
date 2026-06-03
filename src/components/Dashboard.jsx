import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Flame, Droplet, Clock, Moon, Scale, PieChart, Loader2, Heart, Calendar } from 'lucide-react';

const ProgressRing = ({ percentage, color, icon: Icon, title, value, unit }) => {
  const radius = 34;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height="100%" width="100%" viewBox={`0 0 ${radius * 2} ${radius * 2}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle stroke="var(--card-overlay-hover)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: color }}><Icon size={14} /></div>
      </div>
      <div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginTop: '1px' }}>{value} <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{unit}</span></h3>
      </div>
    </div>
  );
};

const MacroChart = ({ protein = 0, carbs = 0, fat = 0, targetCals = 2000, consumedCals = 0 }) => {
  const total = (protein * 4 + carbs * 4 + fat * 9) || 1;
  const pPct = (protein * 4 / total) * 100;
  const cPct = (carbs * 4 / total) * 100;
  const fPct = (fat * 9 / total) * 100;

  return (
    <div className="glass-panel premium-graph-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="graph-header">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Macronutrients</h3>
        <div style={{ background: 'var(--icon-bg)', padding: '6px', borderRadius: '8px' }}>
          <PieChart size={18} style={{ color: 'var(--color-orange)' }} />
        </div>
      </div>
      <div className="graph-container-inner" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--card-overlay)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-violet)" strokeWidth="4" strokeDasharray={`${pPct} 100`} />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-cyan)" strokeWidth="4" strokeDasharray={`${cPct} 100`} strokeDashoffset={`-${pPct}`} />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-green)" strokeWidth="4" strokeDasharray={`${fPct} 100`} strokeDashoffset={`-${pPct + cPct}`} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '950' }}>{Math.round((consumedCals / (targetCals || 2000)) * 100)}%</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '180px' }}>
          {[{ label: 'Protein', val: protein, color: 'var(--color-violet)' }, { label: 'Carbs', val: carbs, color: 'var(--color-cyan)' }, { label: 'Fats', val: fat, color: 'var(--color-green)' }].map(m => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{m.label}</span>
                <span style={{ fontWeight: '900' }}>{Math.round(m.val)}g</span>
              </div>
              <div style={{ height: '5px', background: 'var(--card-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(m.val * 4 / total) * 100}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GoalAchievementView = ({ history = [], goals, todaySummary }) => {
  const [showHistory, setShowHistory] = useState(false);

  const calculateAvg = (data) => {
    if (!data || Object.keys(data).length === 0) return 0;
    const p1 = Math.min(100, ((data.caloriesConsumed || 0) / (goals?.calories || 2000)) * 100);
    const p2 = Math.min(100, ((data.caloriesBurned || 0) / (goals?.caloriesBurned || 500)) * 100);
    const p3 = Math.min(100, ((data.waterConsumedMl || data.waterMl || 0) / (goals?.waterMl || 2500)) * 100);
    const p4 = Math.min(100, ((data.sleepMinutes || 0) / (goals?.sleepMinutes || 480)) * 100);
    const p5 = Math.min(100, ((data.activeMinutes || 0) / (goals?.activeMinutes || 45)) * 100);
    
    // If no data has been logged at all, return 0
    if (p1 === 0 && p2 === 0 && p3 === 0 && p4 === 0 && p5 === 0) return 0;
    
    return Math.round((p1 + p2 + p3 + p4 + p5) / 5);
  };

  const todayAvg = calculateAvg(todaySummary || {});
  const weeklyData = history.map(d => ({ day: d.day, val: calculateAvg(d) }));

  return (
    <div className="glass-panel premium-graph-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div className="graph-header">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{showHistory ? 'Weekly Discipline' : 'Daily Aura Score'}</h3>
        <button onClick={() => setShowHistory(!showHistory)} className="btn btn-orange" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
          {showHistory ? 'TODAY' : 'HISTORY'}
        </button>
      </div>
      <div className="graph-container-inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!showHistory ? (
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--card-overlay)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-orange)" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * todayAvg) / 100} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: '950', color: 'var(--text-primary)' }}>{todayAvg}%</div>
            </div>
          </div>
        ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '150px' }}>
            {weeklyData.map((d, i) => (
              <div key={i} className="chart-bar-wrapper">
                <div style={{ width: '100%', background: `linear-gradient(to top, var(--color-violet), var(--color-violet-light))`, borderRadius: '6px', height: `${d.val}%`, minWidth: '20px' }} className="bar-premium" />
                <span className="chart-day-label" style={{ fontSize: '0.8rem', marginTop: '10px' }}>{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WeightModule = ({ data, user, loggingWeight, newWeight, setNewWeight, handleWeightUpdate }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  if (!data || data.length === 0) return <div className="glass-panel premium-graph-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No weight data yet</div>;

  const maxWeight = Math.max(...data.map(d => d.val)) + 2;
  const minWeight = Math.min(...data.map(d => d.val)) - 2;
  const range = maxWeight - minWeight || 1;
  const height = 220; 
  const width = 400;
  
  const topInset = 20;
  const bottomInset = 40; // space for day labels
  const effectiveHeight = height - topInset - bottomInset;
  const pointsArray = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
    const normalized = (d.val - minWeight) / range;
    const y = topInset + (1 - normalized) * effectiveHeight;
    return { x, y };
  });
  const points = pointsArray.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="glass-panel premium-graph-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div className="graph-header">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{showHistory ? 'Weight History' : 'Current Weight'}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-orange" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div style={{ background: 'rgba(253, 90, 32, 0.1)', padding: '6px', borderRadius: '8px' }}>
            <Scale size={16} style={{ color: 'var(--color-orange)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: '950', lineHeight: 1 }}>{data[data.length-1]?.val || user?.weight}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>Kilograms</div>
          </div>
          
          <form onSubmit={handleWeightUpdate} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '220px', position: 'relative', zIndex: 1 }}>
             <input type="number" step="0.1" className="glass-input" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="New log" style={{ flex: 1, padding: '7px 10px', fontSize: '0.9rem' }} />
             <button type="submit" disabled={loggingWeight} className="btn btn-primary" style={{ padding: '7px 14px' }}>LOG</button>
          </form>
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '220px', width: '100%', marginTop: '20px' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.34" />
                <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1="0" y1={height * v} x2={width} y2={height * v} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
            ))}

            {/* Area Fill */}
            {data.length > 1 && (
              <polygon
                fill="url(#weightGradient)"
                points={`0,${height} ${points} ${width},${height}`}
                style={{ transition: 'all 0.5s ease' }}
              />
            )}

            {data.length > 1 ? (
              <polyline
                fill="none"
                stroke="var(--color-violet)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{ filter: 'drop-shadow(0 0 12px rgba(156,162,255,0.45))' }}
              />
            ) : null}
            
            {data.map((d, i) => {
              const { x, y } = pointsArray[i];
              return (
                <g key={i} className="chart-bar-wrapper">
                  <circle 
                    cx={x} cy={y} r="4" 
                    fill="var(--bg-primary)" 
                    stroke="var(--color-violet)" 
                    strokeWidth="2.5" 
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                  />
                  <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="950" className="graph-label-value">{d.val}</text>
                  <text x={x} y={height + 18} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="900">{d.day}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

const WorkoutTimeGraph = ({ history, todayValue, goal = 45 }) => {
  const [showHistory, setShowHistory] = useState(false);
  const maxMin = Math.max(...history.map(h => h.activeMinutes), todayValue) || 60;
  
  return (
    <div className="glass-panel premium-graph-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div className="graph-header">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{showHistory ? 'Workout History' : 'Today Activity'}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-green" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div className="graph-card-header-icon workout-icon-bg" style={{ padding: '6px' }}>
            <Clock size={16} style={{ color: 'var(--color-green)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: '950', lineHeight: 1 }}>{todayValue || 0}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Minutes Today</div>
          {todayValue > 0 ? (
            <div style={{ marginTop: '10px', padding: '4px 12px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '100px', color: 'var(--color-green)', fontWeight: '800', fontSize: '0.7rem' }}>
              Goal: {goal}m
            </div>
          ) : (
            <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.7rem' }}>No workouts logged today</div>
          )}
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '220px', display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '30px' }}>
          {history.map((d, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <div 
                  className="chart-bar bar-premium bar-workout" 
                  style={{ 
                    height: `${(d.activeMinutes / maxMin) * 100}%`,
                    width: '100%'
                  }}
                >
                   {d.activeMinutes > 0 ? <div className="bar-value-label workout-text" style={{ fontSize: '0.7rem', top: '-20px' }}>{d.activeMinutes}</div> : null}
                </div>
              </div>
              <span className="chart-day-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', marginTop: '10px' }}>{d.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WellnessScoreGraph = ({ history, todaySummary }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  const getMoodScore = (emoji) => {
    if (!emoji) return 0;
    const map = { '😄': 5, '😊': 4, '😐': 3, '😔': 2, '😠': 1 };
    return map[emoji] || 0;
  };

  const calculateScore = (sleep, mood) => {
    // Prevent old backend default '😐' from causing a false 6/10 score
    if (!sleep && (!mood || mood === '😐')) return 0;
    
    const sleepPoints = sleep ? Math.min(5, (sleep / 480) * 5) : 0;
    const moodPoints = getMoodScore(mood);
    if (sleepPoints === 0 && moodPoints === 0) return 0;
    
    // Average of present metrics
    const metrics = [];
    if (sleep) metrics.push(sleepPoints);
    if (mood) metrics.push(moodPoints);
    
    const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    return Math.round(avg * 2 * 10) / 10; // Scale to 10
  };

  const wellnessData = history.map(h => ({
    day: h.day,
    score: calculateScore(h.sleepMinutes, h.moodEmoji)
  }));

  const todayScore = calculateScore(todaySummary?.sleepMinutes, todaySummary?.moodEmoji);

  return (
    <div className="glass-panel premium-graph-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div className="graph-header">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{showHistory ? 'Wellness History' : 'Daily Wellness'}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-violet" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div className="graph-card-header-icon wellness-icon-bg" style={{ padding: '6px' }}>
            <Heart size={16} style={{ color: 'var(--color-violet)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '220px' }}>
          <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: '950', lineHeight: 1, color: 'var(--color-violet)' }}>{todayScore || 0}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wellness Index</div>
          {todayScore > 0 ? (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <div style={{ padding: '4px 8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: 'var(--color-violet)', fontSize: '0.65rem', fontWeight: '700' }}>
                Sleep: {Math.round((todaySummary?.sleepMinutes || 0) / 60 * 10) / 10}h
              </div>
              <div style={{ padding: '4px 8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: 'var(--color-violet)', fontSize: '0.85rem' }}>
                {todaySummary?.moodEmoji || '😐'}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.7rem' }}>No data logged today</div>
          )}
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '220px', display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '30px' }}>
          {wellnessData.map((d, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <div 
                  className="chart-bar bar-premium bar-wellness" 
                  style={{ 
                    height: `${(d.score / 10) * 100}%`,
                    width: '100%'
                  }}
                >
                   {d.score > 0 ? <div className="bar-value-label wellness-text" style={{ fontSize: '0.7rem', top: '-20px' }}>{d.score}</div> : null}
                </div>
              </div>
              <span className="chart-day-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', marginTop: '10px' }}>{d.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [weightHistory, setWeightHistory] = useState(
    user?.weight ? [{ day: 'Start', val: user.weight }] : []
  );
  const [rawHistory, setRawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);

  const fetchData = useCallback(async (date) => {
    setLoading(true);
    try {
      const [wRes, hRes, sRes] = await Promise.all([
        api.getWeightHistory(), 
        api.getDashboardHistory(),
        api.getTodaySummary(date)
        ]);

        let wData = (wRes.data || []).map((d, idx) => ({ 
        day: idx === 0 && (wRes.data || []).length > 1 ? 'Start' : new Date(d.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
        val: d.weight 
        }));

        if (wData.length === 0 && user.weight) {
        wData = [{ day: 'Start', val: user.weight }];
        } else if (wData.length === 1 && user.weight && wData[0].val !== user.weight) {
        // If we only have one log and it's different from starting weight, show both to create a line
        wData = [{ day: 'Start', val: user.weight }, { day: 'Today', val: wData[0].val }];
        }

        setWeightHistory(wData);
      if (hRes && hRes.success) setRawHistory(hRes.history || []);
      if (sRes && sRes.success) setSummary(sRes.summary);
    } catch (error) {
      console.error('Dashboard fetch failed', error);
    } finally {
      setLoading(false);
    }
  }, [user.weight]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  const handleWeightUpdate = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    setLoggingWeight(true);
    try {
      await api.logWeight({ weight: Number(newWeight) });
      setNewWeight('');
      fetchData(selectedDate);
    } catch (error) {
      console.error('Weight update failed', error);
      alert('Update failed');
    } finally {
      setLoggingWeight(false);
    }
  };

  if (loading && !summary) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Loader2 size={32} className="animate-spin" color="var(--color-orange)" /></div>;

  const { caloriesConsumed = 0, caloriesBurned = 0, waterConsumedMl = 0, sleepMinutes = 0, activeMinutes = 0, protein = 0, carbs = 0, fat = 0 } = summary || {};

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient page-title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Performance Metrics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} /> {new Date(selectedDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      <div className="dashboard-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <WeightModule 
          data={weightHistory} 
          user={user} 
          loggingWeight={loggingWeight} 
          newWeight={newWeight} 
          setNewWeight={setNewWeight} 
          handleWeightUpdate={handleWeightUpdate} 
        />
        <WorkoutTimeGraph history={rawHistory} todayValue={activeMinutes} goal={user?.dailyGoals?.activeMinutes} />
        <WellnessScoreGraph history={rawHistory} todaySummary={summary} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        <MacroChart protein={protein} carbs={carbs} fat={fat} targetCals={user?.dailyGoals?.calories} consumedCals={caloriesConsumed} />
        <GoalAchievementView history={rawHistory} goals={user?.dailyGoals} todaySummary={summary} />
      </div>

      <div className="progress-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <ProgressRing percentage={(caloriesConsumed / (user?.dailyGoals?.calories || 2000)) * 100} color="#3b82f6" icon={Flame} title="Energy In" value={caloriesConsumed} unit="kcal" />
        <ProgressRing percentage={(caloriesBurned / (user?.dailyGoals?.caloriesBurned || 500)) * 100} color="var(--color-orange)" icon={Flame} title="Energy Out" value={caloriesBurned} unit="kcal" />
        <ProgressRing percentage={(waterConsumedMl / (user?.dailyGoals?.waterMl || 2500)) * 100} color="var(--color-cyan)" icon={Droplet} title="Hydration" value={waterConsumedMl} unit="mL" />
        <ProgressRing percentage={(sleepMinutes / (user?.dailyGoals?.sleepMinutes || 480)) * 100} color="var(--color-violet)" icon={Moon} title="Recovery" value={Math.round(sleepMinutes/60*10)/10} unit="hrs" />
      </div>
    </div>
  );
};

export default Dashboard;
