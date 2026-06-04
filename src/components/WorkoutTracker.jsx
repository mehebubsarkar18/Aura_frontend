import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';
import { Play, Pause, Calendar, Clock, Flame, Dumbbell, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';

// Import workout icons
import pushupsIcon from '../assets/workout-icons/icons8-pushups-50.png';
import squatsIcon from '../assets/workout-icons/icons8-squats-50.png';
import yogaIcon from '../assets/workout-icons/icons8-yoga-50.png';
import pilatesIcon from '../assets/workout-icons/icons8-pilates-50.png';
import meditationIcon from '../assets/workout-icons/icons8-meditation-50.png';
import gymnasticsIcon from '../assets/workout-icons/icons8-gymnastics-50.png';

// Import Lottie animations
import jumpingJacksAnim from '../assets/workout-animations/JUMPING JACLS.json';
import pushUpsAnim from '../assets/workout-animations/PUSH UPS.json';
import reverseCrunchesAnim from '../assets/workout-animations/REVERSE CRUNCHES.json';
import splitJumpAnim from '../assets/workout-animations/SPLIT JUMP.json';
import squatReachUpsAnim from '../assets/workout-animations/SQUAT REACH UPS.json';
import squatKicksAnim from '../assets/workout-animations/squat_kicks.json';

const PRESETS = [
  { 
    id: 0, 
    name: 'Strength Training', 
    icon: pushupsIcon, 
    color: 'var(--color-orange)', 
    durationMin: 10, 
    calsPerMin: 12,
    benefits: ['Builds muscle', 'Increases strength', 'Boosts metabolism'],
    lottieData: pushUpsAnim
  },
  { 
    id: 1, 
    name: 'HIIT Cardio', 
    icon: gymnasticsIcon, 
    color: '#f87171', 
    durationMin: 7, 
    calsPerMin: 15,
    benefits: ['Burns calories', 'Improves endurance', 'Supports fat loss'],
    lottieData: jumpingJacksAnim
  },
  { 
    id: 2, 
    name: 'Bodyweight Basics', 
    icon: squatsIcon, 
    color: 'var(--color-cyan)', 
    durationMin: 5, 
    calsPerMin: 8,
    benefits: ['Improves functional strength', 'Enhances balance', 'Better mobility'],
    lottieData: squatReachUpsAnim
  },
  { 
    id: 3, 
    name: 'Split Jump', 
    icon: yogaIcon, 
    color: 'var(--color-green)', 
    durationMin: 15, 
    calsPerMin: 4,
    benefits: ['Enhances flexibility', 'Improves posture', 'Promotes relaxation'],
    lottieData: splitJumpAnim
  },
  { 
    id: 4, 
    name: 'Reverse Crunches', 
    icon: pilatesIcon, 
    color: 'var(--color-violet)', 
    durationMin: 10, 
    calsPerMin: 7,
    benefits: ['Strengthens core', 'Improves stability', 'Better posture'],
    lottieData: reverseCrunchesAnim
  },
  { 
    id: 5, 
    name: 'Squat Kicks', 
    icon: meditationIcon, 
    color: '#94a3b8', 
    durationMin: 3, 
    calsPerMin: 2,
    benefits: ['Reduces stress', 'Improves recovery', 'Sharpens mental focus'],
    lottieData: squatKicksAnim
  }
];

const BenefitsModal = ({ workout, onClose }) => {
  if (!workout) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center', position: 'relative', border: '1px solid var(--glass-card-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
          <img src={workout.icon} alt="" style={{ width: '40px' }} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '16px' }} className="text-gradient">{workout.name}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px' }}>
          {workout.benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)' }} />
              {b}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '12px' }}>CLOSE</button>
      </div>
    </div>
  );
};

const WorkoutTracker = ({ onWorkoutLogged, onViewHistory, initialViewHistory = false, onBack }) => {
  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Countdown state
  const [timerRunning, setTimerRunning] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [activeIcon, setActiveIcon] = useState(null);
  const [lottieData, setLottieData] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [calsPerMin, setCalsPerMin] = useState(5);
  const [inProgressId, setInProgressId] = useState(null);
  const [selectedBenefits, setSelectedBenefits] = useState(null);
  
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
        const today = getTodayDateString();
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
          if (preset) {
            setActiveIcon(preset.icon);
            setLottieData(preset.lottieData);
          }
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
        date: getTodayDateString()
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
        setLottieData(preset.lottieData);
        setActiveSession(true);
        setTimerRunning(true);
        return;
      }
    }

    // New session
    setRoutineName(preset.name);
    setActiveIcon(preset.icon);
    setLottieData(preset.lottieData);
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
      setLottieData(null);
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
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: '800' }}>History</h1>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>
                <Dumbbell size={40} style={{ margin: '0 auto 12px' }} />
                <p>No activity recorded yet.</p>
              </div>
            ) : (
              history.map((w, idx) => (
                <div key={idx} className="glass-panel-hover" style={{ padding: '14px', background: 'var(--card-overlay)', borderRadius: '16px', border: '1px solid var(--glass-card-border)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '10px', background: 'rgba(253, 90, 32, 0.1)', borderRadius: '12px', color: 'var(--color-orange)' }}>
                    <Dumbbell size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{w.routineName}</h4>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(w.loggedAt).toLocaleDateString('en-IN')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {w.durationMinutes}m</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                       <Flame size={16} color="var(--color-orange)" />
                       <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>{w.caloriesBurned}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>KCAL</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800' }}>Aura Training</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1px' }}>Choose a routine to begin</p>
            </div>
            <button 
              onClick={onViewHistory}
              className="btn btn-history-orange"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              History
            </button>
          </div>

          <div className="preset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {PRESETS.map((p, i) => (
              <div key={i} className="glass-panel glass-panel-hover" style={{ padding: '24px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '230px' }}>
                {inProgressId === p.id && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-orange)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.05em' }}>IN PROGRESS</div>
                )}
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 12px rgba(0,0,0,0.05)' }}>
                  <img src={p.icon} alt={p.name} style={{ width: '32px' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>{p.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '700' }}>
                  {inProgressId === p.id ? formatTime(timeLeft) : `${p.durationMin} MIN`}
                </p>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
                  <button onClick={() => startSession(p)} className="btn btn-primary btn-narrow">
                    {inProgressId === p.id ? 'RESUME' : 'START'}
                  </button>
                  <button 
                    onClick={() => setSelectedBenefits(p)} 
                    className="btn btn-ghost btn-narrow" 
                    style={{ 
                      padding: '8px', 
                      fontSize: '0.75rem', 
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      background: 'rgba(34, 211, 238, 0.1)',
                      color: 'var(--color-cyan)',
                      fontWeight: '800'
                    }}
                  >
                    Benefits of This
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div className="glass-panel" style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
             <div className="active-icon-anim" style={{ width: '180px', height: '180px', borderRadius: '24px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {lottieData ? (
                  <Lottie 
                    animationData={lottieData} 
                    loop={timerRunning} 
                    style={{ width: '100%', height: '100%' }} 
                  />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-orange)', boxShadow: '0 15px 30px rgba(253, 90, 32, 0.2)' }}>
                    <img src={activeIcon} alt="" style={{ width: '50px' }} />
                  </div>
                )}
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }} className="text-gradient">{routineName}</h2>
               <div style={{ fontSize: '4rem', fontFamily: 'monospace', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '2px', lineHeight: 1 }}>{formatTime(timeLeft)}</div>
             </div>

             <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
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
      <BenefitsModal workout={selectedBenefits} onClose={() => setSelectedBenefits(null)} />
    </div>
  );
};

export default WorkoutTracker;

