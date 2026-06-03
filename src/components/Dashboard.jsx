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
    <div className="glass-panel glass-panel-hover" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 140px' }}>
      <div style={{ position: 'relative', width: radius * 1.8, height: radius * 1.8, flexShrink: 0 }}>
        <svg height="100%" width="100%" viewBox={`0 0 ${radius * 2} ${radius * 2}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle stroke="var(--card-overlay-hover)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: color }}><Icon size={12} /></div>
      </div>
      <div>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '1px' }}>{value} <span style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{unit}</span></h3>
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
    <div className="glass-panel premium-graph-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Micronutrients</h3>
      </div>
      <div className="graph-container-inner" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--card-overlay)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-violet)" strokeWidth="4" strokeDasharray={`${pPct} 100`} />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-cyan)" strokeWidth="4" strokeDasharray={`${cPct} 100`} strokeDashoffset={`-${pPct}`} />
            <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--color-green)" strokeWidth="4" strokeDasharray={`${fPct} 100`} strokeDashoffset={`-${pPct + cPct}`} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '950' }}>{Math.round((consumedCals / (targetCals || 2000)) * 100)}%</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
          {[{ label: 'Protein', val: protein, color: 'var(--color-violet)' }, { label: 'Carbs', val: carbs, color: 'var(--color-cyan)' }, { label: 'Fats', val: fat, color: 'var(--color-green)' }].map(m => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{m.label}</span>
                <span style={{ fontWeight: '900' }}>{Math.round(m.val)}g</span>
              </div>
              <div style={{ height: '4px', background: 'var(--card-overlay)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(m.val * 4 / total) * 100}%`, height: '100%', background: m.color, borderRadius: '2px' }} />
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
    <div className="glass-panel premium-graph-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{showHistory ? 'Weekly Discipline' : 'Daily Aura Score'}</h3>
        <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-history-orange" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
          {showHistory ? 'TODAY' : 'HISTORY'}
        </button>
      </div>
      <div className="graph-container-inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!showHistory ? (
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--card-overlay)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-orange)" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * todayAvg) / 100} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '950', color: 'var(--text-primary)' }}>{todayAvg}%</div>
            </div>
          </div>
        ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', marginTop: '20px' }}>
            {weeklyData.map((d, i) => (
              <div key={i} className="chart-bar-wrapper">
                <div style={{ 
                  flex: 1, 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  width: '100%', 
                  maxWidth: '24px', 
                  background: 'rgba(255,255,255,0.04)', 
                  borderRadius: '12px 12px 4px 4px' 
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    width: '100%', 
                    textAlign: 'center', 
                    fontSize: '0.65rem', 
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                    opacity: d.val > 0 ? 1 : 0.4
                  }}>
                    {d.val}%
                  </div>
                  <div style={{ 
                    width: '100%', 
                    background: d.val > 0 ? `linear-gradient(to top, var(--color-violet), var(--color-violet-light))` : 'rgba(255,255,255,0.08)', 
                    borderRadius: '12px 12px 4px 4px', 
                    height: `${d.val || 4}%`,
                    opacity: d.val > 0 ? 1 : 0.2
                  }} className="bar-premium" />
                </div>
                <span className="chart-day-label" style={{ fontSize: '0.65rem', marginTop: '8px', fontWeight: '800', opacity: 0.8 }}>{d.day}</span>
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
  const height = 180; 
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
    <div className="glass-panel premium-graph-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{showHistory ? 'Weight History' : 'Current Weight'}</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-history-orange" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div className="mobile-hide-icon" style={{ background: 'var(--icon-bg)', padding: '5px', borderRadius: '7px' }}>
            <Scale size={16} style={{ color: 'var(--color-orange)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '950', lineHeight: 1 }}>{data[data.length-1]?.val || user?.weight}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1px' }}>Kilograms</div>
          </div>
          
          <form onSubmit={handleWeightUpdate} style={{ display: 'flex', gap: '5px', width: '100%', maxWidth: '160px', position: 'relative', zIndex: 1 }}>
             <input type="number" step="0.1" className="glass-input" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="New log" style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }} />
             <button type="submit" disabled={loggingWeight} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>LOG</button>
          </form>
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '180px', width: '100%', marginTop: '12px' }}>
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
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{ filter: 'drop-shadow(0 0 10px rgba(156,162,255,0.4))' }}
              />
            ) : null}
            
            {data.map((d, i) => {
              const { x, y } = pointsArray[i];
              return (
                <g key={i} className="chart-bar-wrapper">
                  <circle 
                    cx={x} cy={y} r="3.5" 
                    fill="var(--bg-primary)" 
                    stroke="var(--color-violet)" 
                    strokeWidth="2" 
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                  />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="950" className="graph-label-value">{d.val}</text>
                  <text x={x} y={height + 15} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight="900">{d.day}</text>
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
    <div className="glass-panel premium-graph-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{showHistory ? 'Workout History' : 'Today Activity'}</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-history-green" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div className="mobile-hide-icon" style={{ background: 'var(--icon-bg)', padding: '5px', borderRadius: '7px' }}>
            <Clock size={16} style={{ color: 'var(--color-green)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <div className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '950', lineHeight: 1 }}>{todayValue || 0}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Minutes Today</div>
          {todayValue > 0 ? (
            <div style={{ marginTop: '8px', padding: '3px 10px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '100px', color: 'var(--color-green)', fontWeight: '800', fontSize: '0.65rem' }}>
              Goal: {goal}m
            </div>
          ) : (
            <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.65rem' }}>No workouts logged today</div>
          )}
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '180px', display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '25px', position: 'relative' }}>
          {history.map((d, i) => {
            const barHeight = d.activeMinutes > 0 ? Math.max(8, (d.activeMinutes / maxMin) * 82) : 0;
            return (
              <div key={i} className="chart-bar-wrapper">
                <div style={{ 
                  flex: 1, 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  width: '100%', 
                  maxWidth: '24px', 
                  background: 'rgba(255,255,255,0.04)', 
                  borderRadius: '12px 12px 4px 4px'
                }}>
                  <div 
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '0.7rem', 
                      top: '-24px',
                      fontWeight: '900',
                      color: 'var(--text-primary)',
                      opacity: d.activeMinutes > 0 ? 1 : 0.4
                    }}
                  >
                    {d.activeMinutes}
                  </div>
                  <div 
                    className="bar-premium" 
                    style={{ 
                      height: `${barHeight || 4}%`,
                      width: '100%',
                      background: d.activeMinutes > 0 ? 'linear-gradient(to top, var(--color-green), #86efac)' : 'rgba(255,255,255,0.08)',
                      borderRadius: '12px 12px 4px 4px',
                      opacity: d.activeMinutes > 0 ? 1 : 0.2
                    }}
                  />
                </div>
                <span className="chart-day-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.65rem', marginTop: '8px', fontWeight: '800', opacity: 0.8 }}>{d.day}</span>
              </div>
            );
          })}
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
    <div className="glass-panel premium-graph-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{showHistory ? 'Wellness History' : 'Daily Wellness'}</h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-history-violet" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
            {showHistory ? 'TODAY' : 'HISTORY'}
          </button>
          <div className="mobile-hide-icon" style={{ background: 'var(--icon-bg)', padding: '5px', borderRadius: '7px' }}>
            <Heart size={16} style={{ color: 'var(--color-violet)' }} />
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', minHeight: '180px' }}>
          <div className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '950', lineHeight: 1, color: 'var(--color-violet)' }}>{todayScore || 0}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wellness Index</div>
          {todayScore > 0 ? (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              <div style={{ padding: '3px 8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '6px', color: 'var(--color-violet)', fontSize: '0.6rem', fontWeight: '700' }}>
                Sleep: {Math.round((todaySummary?.sleepMinutes || 0) / 60 * 10) / 10}h
              </div>
              <div style={{ padding: '3px 8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '6px', color: 'var(--color-violet)', fontSize: '0.75rem' }}>
                {todaySummary?.moodEmoji || '😐'}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.65rem' }}>No data logged today</div>
          )}
        </div>
      ) : (
        <div className="graph-container-inner" style={{ height: '180px', display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '20px' }}>
          {wellnessData.map((d, i) => (
            <div key={i} className="chart-bar-wrapper">
              <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'flex-end', 
                width: '100%', 
                maxWidth: '24px', 
                background: 'rgba(255,255,255,0.04)', 
                borderRadius: '12px 12px 4px 4px'
              }}>
                <div 
                  style={{ 
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.7rem', 
                    top: '-24px',
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                    opacity: d.score > 0 ? 1 : 0.4
                  }}
                >
                  {d.score}
                </div>
                <div 
                  className="bar-premium" 
                  style={{ 
                    height: `${(d.score / 10) * 100 || 4}%`,
                    width: '100%',
                    background: d.score > 0 ? 'linear-gradient(to top, var(--color-violet), #c084fc)' : 'rgba(255,255,255,0.08)',
                    borderRadius: '12px 12px 4px 4px',
                    opacity: d.score > 0 ? 1 : 0.2
                  }}
                />
              </div>
              <span className="chart-day-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.65rem', marginTop: '8px', fontWeight: '800', opacity: 0.8 }}>{d.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Synchronous initial data from cache for ultra-fast loading
  const cachedSummaryRes = api.getCached(`dashboard_summary_${selectedDate || 'today'}`);
  const cachedHistoryRes = api.getCached('dashboard_history');
  const cachedWeightRes = api.getCached('weight_history');
  
  const getInitialWeightHistory = () => {
    if (cachedWeightRes && cachedWeightRes.data) {
      return cachedWeightRes.data.map((d, idx) => ({ 
        day: idx === 0 && cachedWeightRes.data.length > 1 ? 'Start' : new Date(d.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
        val: d.weight 
      }));
    }
    return user?.weight ? [{ day: 'Start', val: user.weight }] : [];
  };

  const [summary, setSummary] = useState(cachedSummaryRes?.summary || null);
  const [weightHistory, setWeightHistory] = useState(getInitialWeightHistory());
  const [rawHistory, setRawHistory] = useState(cachedHistoryRes?.history || []);
  const [loading, setLoading] = useState(!cachedSummaryRes); // Don't show loader if we have cached summary
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);
  
  // Mobile graph switcher state
  const [activeGraphIndex, setActiveGraphIndex] = useState(0);

  const fetchData = useCallback(async (date) => {
    const processData = (wRes, hRes, sRes) => {
      let wData = (wRes.data || []).map((d, idx) => ({ 
        day: idx === 0 && (wRes.data || []).length > 1 ? 'Start' : new Date(d.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
        val: d.weight 
      }));

      if (wData.length === 0 && user.weight) {
        wData = [{ day: 'Start', val: user.weight }];
      } else if (wData.length === 1 && user.weight && wData[0].val !== user.weight) {
        wData = [{ day: 'Start', val: user.weight }, { day: 'Today', val: wData[0].val }];
      }

      setWeightHistory(wData);
      if (hRes && hRes.success) setRawHistory(hRes.history || []);
      if (sRes && sRes.success) setSummary(sRes.summary);
    };

    // Always fetch fresh data in background
    try {
      const [wRes, hRes, sRes] = await Promise.all([
        api.getWeightHistory(false), 
        api.getDashboardHistory(false),
        api.getTodaySummary(date, false)
      ]);
      processData(wRes, hRes, sRes);
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

  if (loading) return (
    <div className="loading-screen" style={{ height: '70vh' }}>
      <div className="aura-pulse">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="loading-text">SYNCING YOUR AURA</div>
    </div>
  );

  const { caloriesConsumed = 0, caloriesBurned = 0, waterConsumedMl = 0, sleepMinutes = 0, activeMinutes = 0, protein = 0, carbs = 0, fat = 0 } = summary || {};

  const renderGraph = (index) => {
    switch(index) {
      case 0: return <WeightModule data={weightHistory} user={user} loggingWeight={loggingWeight} newWeight={newWeight} setNewWeight={setNewWeight} handleWeightUpdate={handleWeightUpdate} />;
      case 1: return <WorkoutTimeGraph history={rawHistory} todayValue={activeMinutes} goal={user?.dailyGoals?.activeMinutes} />;
      case 2: return <WellnessScoreGraph history={rawHistory} todaySummary={summary} />;
      case 3: return <MacroChart protein={protein} carbs={carbs} fat={fat} targetCals={user?.dailyGoals?.calories} consumedCals={caloriesConsumed} />; 
      case 4: return <GoalAchievementView history={rawHistory} goals={user?.dailyGoals} todaySummary={summary} />;
      default: return null;
    }
  };

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
      
      <div className="dashboard-graphs-container">
        <div className="graph-item-macros">{renderGraph(3)}</div>
        <div className="graph-item-aura">{renderGraph(4)}</div>
        <div className="graph-item-workout">{renderGraph(1)}</div>
        <div className="graph-item-wellness">{renderGraph(2)}</div>
        <div className="graph-item-weight">{renderGraph(0)}</div>
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
