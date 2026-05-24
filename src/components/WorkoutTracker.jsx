import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Play, Pause, Square, Plus, Trash2, Calendar, Clock, Flame, Dumbbell } from 'lucide-react';

const PRESETS = [
  {
    name: 'Upper Body Push',
    exercises: [
      { name: 'Barbell Bench Press', sets: [{ reps: 10, weightKg: 60 }] },
      { name: 'Dumbbell Overhead Press', sets: [{ reps: 10, weightKg: 15 }] },
      { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weightKg: 20 }] },
    ]
  },
  {
    name: 'Leg Day Blast',
    exercises: [
      { name: 'Barbell Back Squats', sets: [{ reps: 12, weightKg: 80 }] },
      { name: 'Romanian Deadlifts', sets: [{ reps: 10, weightKg: 70 }] },
      { name: 'Leg Extensions', sets: [{ reps: 12, weightKg: 40 }] },
    ]
  },
  {
    name: 'Core & Cardio Burn',
    exercises: [
      { name: 'Plank Hold', sets: [{ reps: 60, weightKg: 0 }] },
      { name: 'Hanging Leg Raises', sets: [{ reps: 12, weightKg: 0 }] },
      { name: 'Kettlebell Swings', sets: [{ reps: 15, weightKg: 16 }] },
    ]
  }
];

const WorkoutTracker = ({ onWorkoutLogged }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(false);
  
  // Timer States
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Active Workout Structure
  const [routineName, setRoutineName] = useState('My Custom Workout');
  const [activeExercises, setActiveExercises] = useState([]);
  const [caloriesBurned, setCaloriesBurned] = useState(150);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkoutHistory();
      setHistory(data.workouts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Synthesize Web Audio sounds for retro-premium micro-feedbacks
  const playAudioCue = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'success') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.1); // B5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'finish') {
        // Play minor ascending arpeggio (magical recovery tune)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Maj chord arpeggio
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.02, audioCtx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.5);
          osc.start(audioCtx.currentTime + idx * 0.12);
          osc.stop(audioCtx.currentTime + idx * 0.12 + 0.5);
        });
      }
    } catch (e) {
      console.log('Audio Context muted / blocked');
    }
  };

  // Timer Handlers
  const handleStartTimer = () => {
    playAudioCue('click');
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const handlePauseTimer = () => {
    playAudioCue('click');
    setTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const handleResetTimer = () => {
    playAudioCue('click');
    setTimerRunning(false);
    clearInterval(timerRef.current);
    setTime(0);
  };

  const startSession = (preset = null) => {
    playAudioCue('success');
    setActiveSession(true);
    setTime(0);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    if (preset) {
      setRoutineName(preset.name);
      setActiveExercises(JSON.parse(JSON.stringify(preset.exercises))); // Deep Copy
    } else {
      setRoutineName('My Custom Workout');
      setActiveExercises([{ name: 'Barbell Bench Press', sets: [{ reps: 10, weightKg: 60 }] }]);
    }
  };

  // Routine Builders
  const addExercise = () => {
    playAudioCue('click');
    setActiveExercises([...activeExercises, { name: 'New Exercise', sets: [{ reps: 10, weightKg: 20 }] }]);
  };

  const removeExercise = (idx) => {
    playAudioCue('click');
    setActiveExercises(activeExercises.filter((_, i) => i !== idx));
  };

  const updateExerciseName = (idx, name) => {
    const updated = [...activeExercises];
    updated[idx].name = name;
    setActiveExercises(updated);
  };

  const addSet = (exIdx) => {
    playAudioCue('success');
    const updated = [...activeExercises];
    const prevSet = updated[exIdx].sets[updated[exIdx].sets.length - 1] || { reps: 10, weightKg: 20 };
    updated[exIdx].sets.push({ reps: prevSet.reps, weightKg: prevSet.weightKg });
    setActiveExercises(updated);
  };

  const removeSet = (exIdx, setIdx) => {
    playAudioCue('click');
    const updated = [...activeExercises];
    updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
    setActiveExercises(updated);
  };

  const updateSetMetric = (exIdx, setIdx, key, val) => {
    const updated = [...activeExercises];
    updated[exIdx].sets[setIdx][key] = Number(val);
    setActiveExercises(updated);
  };

  const finishWorkout = async () => {
    playAudioCue('finish');
    clearInterval(timerRef.current);
    setTimerRunning(false);

    const durationMins = Math.max(1, Math.round(time / 60));
    // Simple calorie model: active body burns ~7.5 kcal per active workout minute
    const computedCals = Math.round(durationMins * 7.5);

    try {
      await api.logWorkout({
        routineName,
        exercisesCompleted: activeExercises,
        durationMinutes: durationMins,
        caloriesBurned: computedCals,
      });

      setActiveSession(false);
      setTime(0);
      fetchHistory();
      onWorkoutLogged();
    } catch (err) {
      alert('Failed to log workout: ' + err.message);
    }
  };

  // Format digital stopwatch display
  const formatTime = (secs) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%' }}>
      
      {/* LEFT PORTION: ACTIVE LOGGER OR ROUTINE CHOOSER (8-COLUMNS) */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {!activeSession ? (
          /* Start Workout Library */
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }} className="text-gradient">Start a Workout</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Launch an active log with a preset routine or a custom builder.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {PRESETS.map((preset, idx) => (
                <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                  <div>
                    <h3 style={{ color: 'var(--color-orange)', fontSize: '1.15rem' }}>{preset.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                      {preset.exercises.map(ex => ex.name).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => startSession(preset)}
                    className="btn btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.9rem', alignSelf: 'flex-start' }}
                  >
                    Load Routine
                  </button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-card-border)', paddingTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => startSession(null)}
                className="glass-panel"
                style={{
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: '600',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={18} />
                Build Custom Workout
              </button>
            </div>
          </div>
        ) : (
          /* Active Workout Session Panel */
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header controls & Digital stopwatch */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-card-border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <input
                  type="text"
                  className="glass-input"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  style={{ fontSize: '1.4rem', fontWeight: '700', padding: '6px 12px', width: '250px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem' }}>
                  <Clock size={14} />
                  <span>Duration Tracker</span>
                </div>
              </div>

              {/* Timer Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-orange)' }}>
                  {formatTime(time)}
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {timerRunning ? (
                    <button onClick={handlePauseTimer} className="glass-panel" style={{ padding: '10px', color: '#fbbf24' }}>
                      <Pause size={18} />
                    </button>
                  ) : (
                    <button onClick={handleStartTimer} className="glass-panel" style={{ padding: '10px', color: '#34d399' }}>
                      <Play size={18} />
                    </button>
                  )}
                  <button onClick={finishWorkout} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                    <Square size={14} fill="white" />
                    Finish
                  </button>
                </div>
              </div>
            </div>

            {/* Exercises List editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeExercises.map((exercise, exIdx) => (
                <div key={exIdx} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <input
                      type="text"
                      className="glass-input"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                      style={{ fontWeight: '600', width: '60%' }}
                    />
                    <button onClick={() => removeExercise(exIdx)} style={{ background: 'transparent', color: '#f87171' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Set Headings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', paddingLeft: '8px' }}>
                    <span>SET</span>
                    <span>REPS</span>
                    <span>WEIGHT (kg)</span>
                    <span></span>
                  </div>

                  {/* Sets log values */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '8px' }}>
                          {setIdx + 1}
                        </span>
                        <input
                          type="number"
                          className="glass-input"
                          value={set.reps}
                          onChange={(e) => updateSetMetric(exIdx, setIdx, 'reps', e.target.value)}
                          style={{ padding: '6px 12px' }}
                        />
                        <input
                          type="number"
                          className="glass-input"
                          value={set.weightKg}
                          onChange={(e) => updateSetMetric(exIdx, setIdx, 'weightKg', e.target.value)}
                          style={{ padding: '6px 12px' }}
                        />
                        <button onClick={() => removeSet(exIdx, setIdx)} style={{ background: 'transparent', color: '#f87171', border: 'none' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSet(exIdx)}
                    className="glass-panel"
                    style={{
                      padding: '8px 16px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <Plus size={14} />
                    Add Set
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addExercise}
              className="glass-panel"
              style={{
                padding: '12px',
                color: 'white',
                background: 'rgba(255,255,255,0.02)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} />
              Add Exercise Row
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PORTION: HISTORY SUMMARY FEED (4-COLUMNS) */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dumbbell size={18} style={{ color: 'var(--color-orange)' }} />
              Workout History
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Your physical metrics logs feed.</p>
          </div>

          {loading ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading session history...</span>
          ) : history.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Dumbbell size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <span>No completed workouts logged yet. Load a routine to start your log!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
              {history.map((workout, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-orange)' }}>
                      {workout.routineName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(workout.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {workout.durationMinutes}m
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={12} />
                      {workout.caloriesBurned} kcal
                    </span>
                  </div>

                  {workout.exercisesCompleted && workout.exercisesCompleted.length > 0 && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>EXERCISES:</span>
                      <ul style={{ paddingLeft: '14px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', listStyleType: 'circle' }}>
                        {workout.exercisesCompleted.map((ex, i) => (
                          <li key={i}>
                            {ex.name} ({ex.sets.length} sets)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
