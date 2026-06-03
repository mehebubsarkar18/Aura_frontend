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
    
    if (val.trim().length > 0) {
      const query = val.toLowerCase().trim();
      const terms = query.split(/\s+/);
      
      const filtered = (INDIAN_FOOD_DATABASE || [])
        .map(food => {
          const name = food.name.toLowerCase();
          let score = 0;
          
          // Exact match get highest priority
          if (name === query) score += 100;
          
          // Starts with get high priority
          if (name.startsWith(query)) score += 60;
          
          // Word starts with
          const words = name.split(/\s+/);
          if (words.some(word => word.startsWith(query))) score += 40;

          // Multi-term matching (all terms must be present)
          const allTermsMatch = terms.every(term => name.includes(term));
          if (allTermsMatch) score += 30;

          // Partial matches
          const matchCount = terms.filter(term => name.includes(term)).length;
          score += matchCount * 5;

          return { ...food, score };
        })
        .filter(food => food.score > 5) // Minimum score threshold
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 10);

      setSuggestions(filtered);
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
      <div className="history-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn btn-ghost btn-icon" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: '800' }}>History</h1>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} style={{ color: 'var(--color-orange)' }} />
            <input 
              type="date" 
              className="glass-input" 
              value={historyDate} 
              onChange={e => setHistoryDate(e.target.value)} 
              style={{ fontSize: '0.95rem', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DAILY TOTAL</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>{totalCals} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>kcal</span></h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentFoods.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3 }}>
                <Utensils size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.95rem' }}>No data for this date.</p>
              </div>
            ) : (
              currentFoods.map(f => (
                <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--card-overlay)', borderRadius: '12px', border: '1px solid var(--glass-card-border)' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{f.foodItem}</h4>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem' }}>
                      <span>P: {f.protein}g</span> <span>C: {f.carbs}g</span> <span>F: {f.fat}g</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--color-orange)' }}>{f.calories}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.6 }}>KCAL</div>
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
    <div className="nutrition-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', width: '100%' }}>
      
      <div className="tracker-primary" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>Nutrition</h2>
            <button 
              onClick={onViewHistory}
              className="btn btn-history-cyan"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              History
            </button>
          </div>

          <div style={{ padding: '20px', background: 'var(--card-overlay)', borderRadius: '20px', border: '1px solid var(--glass-card-border)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Daily Progression</span>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', marginTop: '2px', color: 'var(--text-primary)' }}>{totalCals} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/ {dailyCals} kcal</span></h3>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--color-orange)' }}>{Math.round((totalCals / dailyCals) * 100)}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--icon-bg)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (totalCals / dailyCals) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-orange), #f97316)', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Protein', val: foods.reduce((s, f) => s + f.protein, 0), target: 150, color: '#3b82f6', icon: Beef },
              { label: 'Carbs', val: foods.reduce((s, f) => s + f.carbs, 0), target: 250, color: 'var(--color-orange)', icon: Wheat },
              { label: 'Fats', val: foods.reduce((s, f) => s + f.fat, 0), target: 70, color: 'var(--color-green)', icon: Pizza }
            ].map(m => (
              <div key={m.label} style={{ padding: '12px', background: 'var(--card-overlay)', borderRadius: '14px', border: '1px solid var(--glass-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                   <m.icon size={12} style={{ color: m.color }} />
                   <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.label}</span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>{Math.round(m.val)}g</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '2px' }}>/ {m.target}g</span>
                </div>
                <div style={{ height: '3px', background: 'var(--icon-bg)', borderRadius: '1.5px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (m.val / m.target) * 100)}%`, height: '100%', background: m.color, borderRadius: '1.5px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>Today's Entries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {foods.length === 0 ? (
              <p style={{ opacity: 0.3, textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>No logs yet</p>
            ) : (
              foods.map(f => (
                <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--card-overlay)', borderRadius: '12px', border: '1px solid var(--glass-card-border)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>{f.foodItem}</h4>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px', fontWeight: '600' }}>P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: '6px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>{f.calories}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', opacity: 0.5 }}>KCAL</div>
                  </div>
                  <button onClick={() => handleDeleteFood(f._id)} className="btn btn-ghost btn-icon" style={{ color: '#f87171', padding: '5px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="tracker-secondary" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
            <Plus size={20} style={{ color: 'var(--color-orange)' }} /> Log Meal
          </h3>
          <form onSubmit={handleLogFood} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="food-search-container" style={{ position: 'relative' }} ref={suggestionRef}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Food Name</label>
              <div style={{ position: 'relative' }}>
                <input type="text" className="glass-input food-search-input" value={foodItem} onChange={handleFoodInputChange} placeholder="Search..." style={{ width: '100%', padding: '8px 12px', fontSize: '0.95rem' }} required />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="food-suggestions-dropdown" style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  marginTop: '8px', 
                  zIndex: 1000, 
                  maxHeight: '280px', 
                  overflowY: 'auto', 
                  padding: '10px', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)', 
                  border: '1px solid var(--glass-card-border)',
                  background: '#1a1f2e', // Deep solid blue-gray background
                  borderRadius: '16px'
                }}>
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectSuggestion(s)} 
                      className="suggestion-item"
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        marginBottom: '6px', 
                        background: 'rgba(255,255,255,0.03)', 
                        transition: 'all 0.2s ease',
                        border: '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--icon-bg)';
                        e.currentTarget.style.borderColor = 'rgba(253, 90, 32, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--card-overlay)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-orange)' }}>{s.calories} kcal</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#3b82f6' }}>P: {s.protein}g</span>
                          <span style={{ color: 'var(--color-orange)' }}>C: {s.carbs}g</span>
                          <span style={{ color: 'var(--color-green)' }}>F: {s.fat}g</span>
                        </div>
                        {s.unit && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>per {s.unit}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Quantity</label>
                  <input type="number" className="glass-input" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" style={{ padding: '8px 12px', fontSize: '0.95rem' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Calories</label>
                  <input type="number" className="glass-input" value={calories} onChange={e => setCalories(e.target.value)} required style={{ padding: '8px 12px', fontSize: '0.95rem' }} />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Protein</label>
                <input type="number" className="glass-input" value={protein} onChange={e => setProtein(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Carbs</label>
                <input type="number" className="glass-input" value={carbs} onChange={e => setCarbs(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.95rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.7, color: 'var(--text-secondary)' }}>Fat</label>
                <input type="number" className="glass-input" value={fat} onChange={e => setFat(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.95rem' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '4px', padding: '10px' }}>LOG MEAL</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
           <div style={{ textAlign: 'center' }}>
             <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
               <Droplet size={18} /> Hydration
             </h3>
             <p style={{ marginTop: '2px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Goal: {dailyWater} mL</p>
           </div>

           <div className="hydration-glass-container">
              <div className="hydration-glass">
                <div className="hydration-water" style={{ height: `${hydrationPct}%` }}>
                  <div className="hydration-water-wave" />
                </div>
              </div>
              <div className="glass-base-decoration" />
              <div className="loading-text" style={{ fontSize: '1.4rem', color: 'var(--color-cyan)', marginTop: '10px' }}>
                {hydrationPct >= 100 ? 'Hydrated!' : hydrationPct > 85 ? 'Almost Full' : 'Filling up...'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>{Math.round(hydrationPct)}%</div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
             {[250, 500, 750].map(amt => (
               <button key={amt} onClick={() => handleLogWater(amt)} className="btn btn-cyan" style={{ padding: '8px', fontSize: '0.85rem' }}>+{amt}</button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionHydration;
