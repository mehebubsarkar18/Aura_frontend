import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';
import { INDIAN_FOOD_DATABASE } from '../utils/foodDatabase';
import { Utensils, Droplet, Plus, Trash2, Search, Beef, Wheat, Pizza, ArrowLeft, Calendar } from 'lucide-react';

const NutritionHydration = ({ user, onLogsUpdated, onViewHistory, initialViewHistory = false, onBack }) => {
  const [foods, setFoods] = useState([]);
  const [waterTotal, setWaterTotal] = useState(0);
  
  // History states
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyFoods, setHistoryFoods] = useState([]);
  const [historyWaterTotal, setHistoryWaterTotal] = useState(0);

  // Form states
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Search states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api.getNutritionHistory(historyDate);
      if (data && data.success) {
        setHistoryFoods(data.foods || []);
        const totalWater = (data.waterLogs || []).reduce((s, l) => s + l.amountMl, 0);
        setHistoryWaterTotal(totalWater);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    }
  }, [historyDate]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.getTodayNutrition();
      if (data && data.success && data.nutrition) {
        setFoods(data.nutrition.foods || []);
        setWaterTotal(data.nutrition.waterTotalMl || 0);
      }
    } catch (error) {
      console.error('Today logs fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchLogs]);

  useEffect(() => {
    if (initialViewHistory) {
      fetchHistory();
    }
  }, [fetchHistory, initialViewHistory]);

  const handleFoodInputChange = (e) => {
    const val = e.target.value;
    setFoodItem(val);
    if (val.trim().length > 1) {
      const filtered = (INDIAN_FOOD_DATABASE || []).filter(f => f.name.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered.slice(0, 10)); // Limit suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (food) => {
    setFoodItem(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setShowSuggestions(false);
  };

  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!foodItem || !calories) return;

    try {
      const q = Number(quantity) || 1;
      await api.logFood({
        foodItem: q > 1 ? `${foodItem} (x${q})` : foodItem,
        calories: Number(calories) * q,
        protein: (Number(protein) || 0) * q,
        carbs: (Number(carbs) || 0) * q,
        fat: (Number(fat) || 0) * q,
      });

      setFoodItem(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setQuantity(1);
      fetchLogs();
      if (onLogsUpdated) onLogsUpdated();
    } catch (error) {
      console.error('Logging food failed:', error);
      alert('Logging food failed: ' + error.message);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Remove this food log?')) return;
    try {
      await api.deleteFood(id);
      fetchLogs();
      if (onLogsUpdated) onLogsUpdated();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const handleLogWater = async (amt) => {
    try {
      const data = await api.logWater(amt);
      if (data && data.success) {
        setWaterTotal(data.newWaterTotalMl);
        if (onLogsUpdated) onLogsUpdated();
      }
    } catch (err) {
      console.error('Water log failed:', err);
      alert('Water log failed');
    }
  };

  const currentFoods = initialViewHistory ? historyFoods : foods;
  const currentWater = initialViewHistory ? historyWaterTotal : waterTotal;
  const totalCals = (currentFoods || []).reduce((s, f) => s + f.calories, 0);

  // Robust daily goal fallbacks
  const dailyCals = (user && user.dailyGoals && user.dailyGoals.calories) ? user.dailyGoals.calories : 2000;
  const dailyWater = (user && user.dailyGoals && user.dailyGoals.waterMl) ? user.dailyGoals.waterMl : 2500;

  const hydrationPct = Math.min(100, Math.max(0, (currentWater / dailyWater) * 100));
  const waveTranslateY = 240 - (hydrationPct / 100) * 240;

  if (initialViewHistory) {
    return (
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: '800' }}>History</h1>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Calendar size={24} style={{ color: 'var(--color-orange)' }} />
            <input 
              type="date" 
              className="glass-input" 
              value={historyDate} 
              onChange={e => setHistoryDate(e.target.value)} 
              style={{ fontSize: '1.1rem', padding: '12px 20px' }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>DAILY TOTAL</span>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>{totalCals} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>kcal</span></h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentFoods.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', opacity: 0.3 }}>
                <Utensils size={64} style={{ margin: '0 auto 20px' }} />
                <p style={{ fontSize: '1.2rem' }}>No data for this date.</p>
              </div>
            ) : (
              currentFoods.map(f => (
                <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', background: 'var(--card-overlay)', borderRadius: '20px', border: '1px solid var(--glass-card-border)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>{f.foodItem}</h4>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      <span>P: {f.protein}g</span> <span>C: {f.carbs}g</span> <span>F: {f.fat}g</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-orange)' }}>{f.calories}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.6 }}>KCAL</div>
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
    <div className="nutrition-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%' }}>
      
      <div className="tracker-primary" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>Nutrition</h2>
            <button 
              onClick={onViewHistory}
              className="btn btn-cyan"
            >
              History
            </button>
          </div>

          <div style={{ padding: '32px', background: 'var(--card-overlay)', borderRadius: '28px', border: '1px solid var(--glass-card-border)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Daily Progression</span>
                <h3 style={{ fontSize: '3rem', fontWeight: '900', marginTop: '4px', color: 'var(--text-primary)' }}>{totalCals} <span style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/ {dailyCals} kcal</span></h3>
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-orange)' }}>{Math.round((totalCals / dailyCals) * 100)}%</span>
            </div>
            <div style={{ height: '14px', background: 'var(--icon-bg)', borderRadius: '7px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (totalCals / dailyCals) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-orange), #f97316)', borderRadius: '7px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { label: 'Protein', val: foods.reduce((s, f) => s + f.protein, 0), target: 150, color: '#3b82f6', icon: Beef },
              { label: 'Carbs', val: foods.reduce((s, f) => s + f.carbs, 0), target: 250, color: 'var(--color-orange)', icon: Wheat },
              { label: 'Fats', val: foods.reduce((s, f) => s + f.fat, 0), target: 70, color: 'var(--color-green)', icon: Pizza }
            ].map(m => (
              <div key={m.label} style={{ padding: '24px', background: 'var(--card-overlay)', borderRadius: '24px', border: '1px solid var(--glass-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                   <m.icon size={18} style={{ color: m.color }} />
                   <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{m.label}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>{Math.round(m.val)}g</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>/ {m.target}g</span>
                </div>
                <div style={{ height: '5px', background: 'var(--icon-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (m.val / m.target) * 100)}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px', flex: 1 }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)' }}>Today's Entries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {foods.length === 0 ? (
              <p style={{ opacity: 0.3, textAlign: 'center', padding: '40px' }}>No logs yet</p>
            ) : (
              foods.map(f => (
                <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'var(--card-overlay)', borderRadius: '20px', border: '1px solid var(--glass-card-border)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{f.foodItem}</h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '16px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>{f.calories}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.5 }}>KCAL</div>
                  </div>
                  <button onClick={() => handleDeleteFood(f._id)} className="btn btn-ghost btn-icon" style={{ color: '#f87171' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="tracker-secondary" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)' }}>
            <Plus size={28} style={{ color: 'var(--color-orange)' }} /> Log Meal
          </h3>
          <form onSubmit={handleLogFood} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ position: 'relative' }} ref={suggestionRef}>
              <label style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Food Name</label>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input type="text" className="glass-input" value={foodItem} onChange={handleFoodInputChange} placeholder="Search..." style={{ width: '100%', paddingLeft: '52px' }} required />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-primary)', border: '1px solid var(--glass-card-border)', borderRadius: '16px', marginTop: '12px', zIndex: 100, maxHeight: '280px', overflowY: 'auto', padding: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => selectSuggestion(s)} style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px', background: 'var(--icon-bg)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.calories} kcal • P:{s.protein} C:{s.carbs} F:{s.fat}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Quantity</label>
                  <input type="number" className="glass-input" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Calories</label>
                  <input type="number" className="glass-input" value={calories} onChange={e => setCalories(e.target.value)} required />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Protein</label>
                <input type="number" className="glass-input" value={protein} onChange={e => setProtein(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Carbs</label>
                <input type="number" className="glass-input" value={carbs} onChange={e => setCarbs(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Fat</label>
                <input type="number" className="glass-input" value={fat} onChange={e => setFat(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>LOG MEAL</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
           <div style={{ textAlign: 'center' }}>
             <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
               <Droplet size={32} /> Hydration
             </h3>
             <p style={{ marginTop: '8px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Goal: {dailyWater} mL</p>
           </div>

           <div style={{ position: 'relative', width: '180px', height: '240px', border: '4px solid var(--glass-card-border)', borderRadius: '0 0 60px 60px', overflow: 'hidden', background: 'var(--icon-bg)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', transform: `translateY(${waveTranslateY}px)`, transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <svg width="450" height="300" viewBox="0 0 450 300" style={{ position: 'absolute', left: 0, bottom: 0 }}>
                  <path className="water-wave" d="M 0 40 Q 56.25 25 112.5 40 T 225 40 T 337.5 40 T 450 40 L 450 300 L 0 300 Z" fill="var(--color-cyan)" style={{ opacity: 0.6 }} />
                </svg>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '900', fontSize: '3.6rem', color: 'var(--text-primary)', textShadow: '0 0 20px rgba(0,0,0,0.1)' }}>{Math.round(hydrationPct)}%</div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
             {[250, 500, 750].map(amt => (
               <button key={amt} onClick={() => handleLogWater(amt)} className="btn btn-cyan">+{amt}</button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionHydration;
