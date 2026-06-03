import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';
import { Play, Pause, Calendar, Clock, Flame, Dumbbell, ArrowLeft } from 'lucide-react';

// Import workout icons
import pushupsIcon from '../assets/workout-icons/icons8-pushups-50.png';
import squatsIcon from '../assets/workout-icons/icons8-squats-50.png';
import yogaIcon from '../assets/workout-icons/icons8-yoga-50.png';
import pilatesIcon from '../assets/workout-icons/icons8-pilates-50.png';
import meditationIcon from '../assets/workout-icons/icons8-meditation-50.png';
import gymnasticsIcon from '../assets/workout-icons/icons8-gymnastics-50.png';

const PRESETS = [
  { id: 0, name: 'Strength Training', icon: pushupsIcon, color: 'var(--color-orange)', durationMin: 10, calsPerMin: 12 },
  { id: 1, name: 'HIIT Cardio', icon: gymnasticsIcon, color: '#f87171', durationMin: 7, calsPerMin: 15 },
  { id: 2, name: 'Bodyweight Basics', icon: squatsIcon, color: 'var(--color-cyan)', durationMin: 5, calsPerMin: 8 },
  { id: 3, name: 'Yoga & Flow', icon: yogaIcon, color: 'var(--color-green)', durationMin: 15, calsPerMin: 4 },
  { id: 4, name: 'Pilates Core', icon: pilatesIcon, color: 'var(--color-violet)', durationMin: 10, calsPerMin: 7 },
  { id: 5, name: 'Mindful Rest', icon: meditationIcon, color: '#94a3b8', durationMin: 3, calsPerMin: 2 }
];

const WorkoutTracker = ({ onWorkoutLogged, onViewHistory, initialViewHistory = false, onBack }) => {
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Countdown state
  const [timerRunning, setTimerRunning] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [activeIcon, setActiveIcon] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [calsPerMin, setCalsPerMin] = useState(5);
  const [inProgressId, setInProgressId] = useState(null);
  
  const intervalRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.getWorkoutHistory();
      if (res.success) setHistory(res.workouts || []);
    } catch (error) {
      console.error('Workout fetch failed', error);
    }
  }, []);

  // Load persistent session on mount
  useEffect(() => {
    if (initialViewHistory) {
      fetchHistory();
    } else {
      const saved = localStorage.getItem('aura_workout_session');
      if (saved) {
        const session = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (session.date === today) {
          setRoutineName(session.routineName);
          setTotalDuration(session.totalDuration);
          setTimeLeft(session.timeLeft);
          setCalsPerMin(session.calsPerMin);
          setInProgressId(session.presetId);
          setActiveSession(false); // Show list first, don't force timer view
          setTimerRunning(false); 
          
          // Map icon back
          const preset = PRESETS.find(p => p.id === session.presetId);
          if (preset) setActiveIcon(preset.icon);
        } else {
          localStorage.removeItem('aura_workout_session');
        }
      }
    }
  }, [fetchHistory, initialViewHistory]);

  // Save session progress to localStorage
  useEffect(() => {
    if (inProgressId !== null) {
      const sessionData = {
        presetId: inProgressId,
        routineName,
        totalDuration,
        timeLeft,
        calsPerMin,
        date: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('aura_workout_session', JSON.stringify(sessionData));
    }
  }, [inProgressId, routineName, totalDuration, timeLeft, calsPerMin]);

  const startSession = (preset) => {
    // Check if we should resume
    const saved = localStorage.getItem('aura_workout_session');
    if (saved) {
      const session = JSON.parse(saved);
      if (session.presetId === preset.id) {
        setTimeLeft(session.timeLeft);
        setTotalDuration(session.totalDuration);
        setRoutineName(session.routineName);
        setCalsPerMin(session.calsPerMin);
        setInProgressId(preset.id);
        setActiveIcon(preset.icon);
        setActiveSession(true);
        setTimerRunning(true);
        return;
      }
    }

    // New session
    setRoutineName(preset.name);
    setActiveIcon(preset.icon);
    setCalsPerMin(preset.calsPerMin);
    setTotalDuration(preset.durationMin);
    setTimeLeft(preset.durationMin * 60); // Convert min to sec
    setInProgressId(preset.id);
    setActiveSession(true);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && activeSession) {
      setTimerRunning(false);
      clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timeLeft, activeSession]);

  const finishWorkout = async () => {
    const timeElapsedMin = Math.ceil((totalDuration * 60 - timeLeft) / 60);
    const calories = timeElapsedMin * calsPerMin;
    try {
      await api.logWorkout({ 
        routineName, 
        durationMinutes: timeElapsedMin || 1, 
        caloriesBurned: calories,
        exercisesCompleted: [] 
      });
      setActiveSession(false);
      setTimerRunning(false);
      setInProgressId(null);
      localStorage.removeItem('aura_workout_session');
      onWorkoutLogged();
    } catch (error) {
      console.error('Failed to log workout', error);
      alert('Failed to log workout');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  if (initialViewHistory) {
    return (
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon" style={{ padding: '10px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800' }}>History</h1>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                <Dumbbell size={48} style={{ margin: '0 auto 16px' }} />
                <p>No activity recorded yet.</p>
              </div>
            ) : (
              history.map((w, idx) => (
                <div key={idx} className="glass-panel-hover" style={{ padding: '16px', background: 'var(--card-overlay)', borderRadius: '20px', border: '1px solid var(--glass-card-border)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                  <div style={{ padding: '12px', background: 'rgba(253, 90, 32, 0.1)', borderRadius: '14px', color: 'var(--color-orange)' }}>
                    <Dumbbell size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{w.routineName}</h4>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(w.loggedAt).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {w.durationMinutes}m</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                       <Flame size={18} color="var(--color-orange)" />
                       <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>{w.caloriesBurned}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>KCAL</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-page" style={{ width: '100%' }}>
      {!activeSession ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '800' }}>Aura Training</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '2px' }}>Choose a routine to begin</p>
            </div>
            <button 
              onClick={onViewHistory}
              className="btn btn-orange"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              History
            </button>
          </div>

          <div className="preset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {PRESETS.map((p, i) => (
              <div key={i} className="glass-panel glass-panel-hover" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '260px' }}>
                {inProgressId === p.id && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--color-orange)', color: 'white', padding: '3px 10px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em' }}>IN PROGRESS</div>
                )}
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                  <img src={p.icon} alt={p.name} style={{ width: '40px' }} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>{p.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '700' }}>
                  {inProgressId === p.id ? formatTime(timeLeft) : `${p.durationMin} MIN`}
                </p>
                <button onClick={() => startSession(p)} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '10px' }}>
                  {inProgressId === p.id ? 'RESUME' : 'START'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => { setActiveSession(false); setTimerRunning(false); }} 
              className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={18} /> Back to Routines
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <div className="glass-panel" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
             <div className="active-icon-anim" style={{ width: '120px', height: '120px', borderRadius: '32px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-orange)', boxShadow: '0 20px 40px rgba(253, 90, 32, 0.2)' }}>
                <img src={activeIcon} alt="" style={{ width: '60px' }} />
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }} className="text-gradient">{routineName}</h2>
               <div style={{ fontSize: '5rem', fontFamily: 'monospace', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '3px', lineHeight: 1 }}>{formatTime(timeLeft)}</div>
             </div>

             <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                <button onClick={() => setTimerRunning(!timerRunning)} className="btn btn-ghost" style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}>
                  {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                  {timerRunning ? 'PAUSE' : 'RESUME'}
                </button>
                <button onClick={finishWorkout} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}>FINISH</button>
             </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};

export default WorkoutTracker;
