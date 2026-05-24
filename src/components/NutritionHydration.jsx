import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Coffee, Utensils, Droplet, Plus, Trash2 } from 'lucide-react';

const NutritionHydration = ({ user, onLogsUpdated }) => {
  const [foods, setFoods] = useState([]);
  const [waterTotal, setWaterTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states for Logging Food
  const [mealType, setMealType] = useState('Breakfast');
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getTodayNutrition();
      setFoods(data.nutrition.foods || []);
      setWaterTotal(data.nutrition.waterTotalMl || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!foodItem || !calories) return;

    try {
      await api.logFood({
        mealType,
        foodItem,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      // Clear Form
      setFoodItem('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      fetchLogs();
      onLogsUpdated();
    } catch (err) {
      alert('Failed to log food: ' + err.message);
    }
  };

  const handleLogWater = async (amountMl) => {
    // Play short aquatic bubble click note with Web Audio
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15); // Ascending slide
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}

    try {
      const data = await api.logWater(amountMl);
      setWaterTotal(data.newWaterTotalMl);
      onLogsUpdated();
    } catch (err) {
      alert('Failed to log water: ' + err.message);
    }
  };

  // Compile today's totals
  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
  const totalFat = foods.reduce((sum, f) => sum + f.fat, 0);

  // Compute fluid fill percentage
  const waterGoal = user.dailyGoals.waterMl || 2500;
  const hydrationPct = Math.min(100, Math.max(0, (waterTotal / waterGoal) * 100));

  // Visual offsets for wave height inside glass
  const glassHeight = 180;
  const fillHeight = (hydrationPct / 100) * glassHeight;
  const waveTranslateY = glassHeight - fillHeight;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%' }}>
      
      {/* LEFT PORTION: FOOD LOGGER & MACRO COUNTS (7-COLUMNS) */}
      <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Macro breakdown summary card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Daily Macro Breakdown</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tracking against target: {user.dailyGoals.calories} kcal</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span>Calories Consumed</span>
                <span style={{ fontWeight: '600' }}>{totalCalories} / {user.dailyGoals.calories} kcal</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (totalCalories / user.dailyGoals.calories) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(95deg, var(--color-orange), hsl(340, 90%, 50%))',
                  borderRadius: '5px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Individual Macro metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid var(--glass-card-border)', paddingTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Protein</span>
                <span>{totalProtein}g</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalProtein / 130) * 100)}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: ~130g</span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Carbs</span>
                <span>{totalCarbs}g</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalCarbs / 250) * 100)}%`, height: '100%', background: 'var(--color-orange)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: ~250g</span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Fat</span>
                <span>{totalFat}g</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalFat / 70) * 100)}%`, height: '100%', background: 'var(--color-green)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: ~70g</span>
            </div>
          </div>
        </div>

        {/* Food logging form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Log New Food</h3>
          <form onSubmit={handleLogFood} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Meal Type</label>
                <select
                  className="glass-input"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  style={{ background: '#111827' }}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Food Item Name</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Egg White / Oatmeal"
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calories</label>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Protein</label>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="g"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Carbs</label>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="g"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fat</label>
                <input
                  type="number"
                  className="glass-input"
                  placeholder="g"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}>
              <Plus size={16} />
              Log Food Entry
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PORTION: WAVE GLASS HYDRATION MONITOR (5-COLUMNS) */}
      <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Animated fluid filler card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Droplet size={18} style={{ color: 'var(--color-cyan)' }} />
              Hydration Chamber
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily target: {waterGoal} mL</span>
          </div>

          {/* Interactive SVG Water Glass outline */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: `${glassHeight}px`,
            border: '4px solid rgba(255,255,255,0.15)',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.01)',
            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.05)'
          }}>
            {/* The rising liquid SVG wave inside glass bounds */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: `translateY(${waveTranslateY}px)`,
              transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none'
            }}>
              <svg width="240" height="200" viewBox="0 0 240 200" style={{ position: 'absolute', left: 0, bottom: 0 }}>
                {/* Flowing liquid path */}
                <path
                  d="M 0 15 Q 30 5 60 15 T 120 15 T 180 15 T 240 15 L 240 200 L 0 200 Z"
                  fill="var(--color-cyan)"
                  className="fluid-wave"
                  style={{ opacity: 0.7 }}
                />
                <path
                  d="M 0 20 Q 35 12 70 20 T 140 20 T 210 20 L 240 200 L 0 200 Z"
                  fill="hsl(188, 95%, 42%)"
                  className="fluid-wave"
                  style={{ opacity: 0.85, animationDelay: '-1.5s', animationDuration: '4s' }}
                />
              </svg>
            </div>

            {/* Glowing Percentage display */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: '800',
              fontSize: '1.4rem',
              color: hydrationPct > 45 ? 'white' : 'var(--color-cyan)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              transition: 'color 0.5s ease'
            }}>
              {Math.round(hydrationPct)}%
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-cyan)' }}>{waterTotal} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>mL</span></h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged fluid intake</span>
          </div>

          {/* Fast Increment Button Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', marginTop: 'auto' }}>
            <button
              onClick={() => handleLogWater(250)}
              className="glass-panel"
              style={{ padding: '10px', fontSize: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.02)', fontWeight: '600' }}
            >
              +250ml
            </button>
            <button
              onClick={() => handleLogWater(500)}
              className="glass-panel"
              style={{ padding: '10px', fontSize: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.02)', fontWeight: '600' }}
            >
              +500ml
            </button>
            <button
              onClick={() => handleLogWater(750)}
              className="glass-panel"
              style={{ padding: '10px', fontSize: '0.8rem', color: 'white', background: 'rgba(255,255,255,0.02)', fontWeight: '600' }}
            >
              +750ml
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionHydration;
