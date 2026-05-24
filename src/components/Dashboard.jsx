import React, { useState } from 'react';
import { api } from '../utils/api';
import { Flame, Droplet, Footprints, Moon, Edit3, Save, TrendingUp } from 'lucide-react';

const ProgressRing = ({ percentage, color, icon: Icon, title, value, goal, unit }) => {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="glass-panel glass-panel-hover" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      flex: 1
    }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2, marginBottom: '16px' }}>
        {/* Background Circle */}
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={28} />
        </div>
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>
        {title}
      </span>
      <h3 style={{ fontSize: '1.6rem', marginTop: '4px', fontWeight: '700' }}>
        {value} <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-secondary)' }}>{unit}</span>
      </h3>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        Goal: {goal} {unit} ({Math.round(safePercentage)}%)
      </span>
    </div>
  );
};

const Dashboard = ({ user, todaySummary, onGoalsUpdated }) => {
  const [editingGoals, setEditingGoals] = useState(false);
  const [caloriesGoal, setCaloriesGoal] = useState(user.dailyGoals.calories);
  const [stepsGoal, setStepsGoal] = useState(user.dailyGoals.steps);
  const [waterGoal, setWaterGoal] = useState(user.dailyGoals.waterMl);
  const [sleepGoal, setSleepGoal] = useState(user.dailyGoals.sleepMinutes);
  const [saving, setSaving] = useState(false);

  const {
    caloriesConsumed = 0,
    caloriesBurned = 0,
    waterConsumedMl = 0,
    stepsWalked = 0,
    sleepMinutes = 0,
    activeMinutes = 0,
    mindfulnessMinutes = 0,
  } = todaySummary || {};

  // Percentages relative to goals
  const caloriesPercentage = (caloriesConsumed / user.dailyGoals.calories) * 100;
  const stepsPercentage = (stepsWalked / user.dailyGoals.steps) * 100;
  const waterPercentage = (waterConsumedMl / user.dailyGoals.waterMl) * 100;
  const sleepPercentage = (sleepMinutes / user.dailyGoals.sleepMinutes) * 100;

  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      const data = await api.updateGoals({
        calories: Number(caloriesGoal),
        steps: Number(stepsGoal),
        waterMl: Number(waterGoal),
        sleepMinutes: Number(sleepGoal),
      });
      onGoalsUpdated(data.user);
      setEditingGoals(false);
    } catch (err) {
      alert('Failed to save goals: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Mock static historical comparison columns for SVG Bar chart
  const weekStats = [
    { day: 'Mon', active: 30 },
    { day: 'Tue', active: 45 },
    { day: 'Wed', active: 20 },
    { day: 'Thu', active: 60 },
    { day: 'Fri', active: 40 },
    { day: 'Sat', active: 75 },
    { day: 'Sun', active: activeMinutes },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }} className="text-gradient">
            Aura Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back, {user.fullName}! Here is your wellness summary for today.
          </p>
        </div>

        {/* Goals Action Toggle */}
        <button
          onClick={() => setEditingGoals(!editingGoals)}
          className="glass-panel"
          style={{
            padding: '12px 20px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          {editingGoals ? <Save size={16} /> : <Edit3 size={16} />}
          {editingGoals ? 'Discard Edits' : 'Edit Daily Goals'}
        </button>
      </div>

      {/* Expandable Goals Editor */}
      {editingGoals && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-orange)' }}>Set New Targets</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calories (kcal)</label>
              <input
                type="number"
                className="glass-input"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Steps</label>
              <input
                type="number"
                className="glass-input"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Water Intake (mL)</label>
              <input
                type="number"
                className="glass-input"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sleep (minutes)</label>
              <input
                type="number"
                className="glass-input"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleSaveGoals}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '12px 24px', alignSelf: 'flex-end', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      )}

      {/* Circular Progress Rings Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <ProgressRing
          percentage={caloriesPercentage}
          color="var(--color-orange)"
          icon={Flame}
          title="Calorie Intake"
          value={caloriesConsumed}
          goal={user.dailyGoals.calories}
          unit="kcal"
        />
        <ProgressRing
          percentage={stepsPercentage}
          color="var(--color-cyan)"
          icon={Footprints}
          title="Active Steps"
          value={stepsWalked}
          goal={user.dailyGoals.steps}
          unit="steps"
        />
        <ProgressRing
          percentage={waterPercentage}
          color="var(--color-cyan)"
          icon={Droplet}
          title="Hydration"
          value={waterConsumedMl}
          goal={user.dailyGoals.waterMl}
          unit="mL"
        />
        <ProgressRing
          percentage={sleepPercentage}
          color="var(--color-violet)"
          icon={Moon}
          title="Sleep Log"
          value={Math.round((sleepMinutes / 60) * 10) / 10}
          goal={Math.round((user.dailyGoals.sleepMinutes / 60) * 10) / 10}
          unit="hrs"
        />
      </div>

      {/* Charts & Metric Overview Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Left Side: Weekly Active minutes bar chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} style={{ color: 'var(--color-orange)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Weekly Consistency</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Daily active minutes (workouts logged) over the last 7 days.</p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: '180px',
            padding: '10px 0',
            marginTop: '10px',
            borderBottom: '1px solid var(--glass-card-border)'
          }}>
            {weekStats.map((item, idx) => {
              const maxVal = Math.max(...weekStats.map(w => w.active), 60);
              const heightPct = (item.active / maxVal) * 100;
              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {item.active}m
                  </div>
                  {/* Bar column */}
                  <div style={{
                    width: '28px',
                    height: `${heightPct}%`,
                    background: item.active > 0 ? 'linear-gradient(to top, var(--color-orange), hsl(340, 90%, 50%))' : 'rgba(255,255,255,0.04)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.6s ease',
                    boxShadow: item.active > 0 ? '0 0 10px rgba(253, 90, 32, 0.15)' : 'none'
                  }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Additional Metric Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Minutes Today</span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>{activeMinutes} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>min</span></h2>
            </div>
            <div style={{
              background: 'rgba(253, 90, 32, 0.12)',
              padding: '12px',
              borderRadius: '16px',
              color: 'var(--color-orange)'
            }}>
              <Flame size={24} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calorie Burn Balance</span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>
                {caloriesConsumed - caloriesBurned} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>net kcal</span>
              </h2>
            </div>
            <div style={{
              background: 'rgba(6, 182, 212, 0.12)',
              padding: '12px',
              borderRadius: '16px',
              color: 'var(--color-cyan)'
            }}>
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mindfulness Duration</span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>{mindfulnessMinutes} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>min</span></h2>
            </div>
            <div style={{
              background: 'rgba(168, 85, 247, 0.12)',
              padding: '12px',
              borderRadius: '16px',
              color: 'var(--color-violet)'
            }}>
              <Moon size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
