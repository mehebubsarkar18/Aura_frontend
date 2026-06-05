import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { FileText, Download, Send, TrendingUp, TrendingDown, Minus, Loader2, Calendar, Mail } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const StatCard = ({ title, current, previous, unit, inverse = false }) => {
  const diff = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = diff > 0;
  const isNeutral = diff === 0 || previous === 0;
  
  const getIcon = () => {
    if (isNeutral) return <Minus size={16} className="text-muted" />;
    if (isPositive) return <TrendingUp size={16} style={{ color: inverse ? '#f87171' : '#4ade80' }} />;
    return <TrendingDown size={16} style={{ color: inverse ? '#4ade80' : '#f87171' }} />;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', flex: '1 1 200px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{Math.round(current)}</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
        {getIcon()}
        <span style={{ color: isNeutral ? 'var(--text-muted)' : (isPositive ? (inverse ? '#f87171' : '#4ade80') : (inverse ? '#4ade80' : '#f87171')) }}>
          {isNeutral ? 'No change' : `${Math.abs(diff).toFixed(1)}% vs prev`}
        </span>
      </div>
    </div>
  );
};

const Reports = ({ user }) => {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState(user?.email || '');
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const data = await api.getReportData(type);
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const generatePDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    const { current, previous, type } = reportData;
    
    doc.setFontSize(22);
    doc.text('AuraFit Fitness Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Summary`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);

    const calcPct = (curr, prev) => {
      if (!prev) return curr > 0 ? '+100%' : '0%';
      const diff = ((curr - prev) / prev) * 100;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };
    
    const tableData = [
      ['Metric', 'Current Period', 'Previous Period', 'Change %'],
      ['Calories Burned', `${current.metrics.caloriesBurned} kcal`, `${previous.metrics.caloriesBurned} kcal`, calcPct(current.metrics.caloriesBurned, previous.metrics.caloriesBurned)],
      ['Calories Consumed', `${current.metrics.caloriesConsumed} kcal`, `${previous.metrics.caloriesConsumed} kcal`, calcPct(current.metrics.caloriesConsumed, previous.metrics.caloriesConsumed)],
      ['Active Minutes', `${current.metrics.activeMinutes} min`, `${previous.metrics.activeMinutes} min`, calcPct(current.metrics.activeMinutes, previous.metrics.activeMinutes)],
      ['Workouts', current.metrics.workoutCount, previous.metrics.workoutCount, calcPct(current.metrics.workoutCount, previous.metrics.workoutCount)],
      ['Hydration', `${current.metrics.waterMl} mL`, `${previous.metrics.waterMl} mL`, calcPct(current.metrics.waterMl, previous.metrics.waterMl)],
      ['Avg Sleep', `${(current.metrics.avgSleep / 60).toFixed(1)} hrs`, `${(previous.metrics.avgSleep / 60).toFixed(1)} hrs`, calcPct(current.metrics.avgSleep, previous.metrics.avgSleep)],
      ['Weight Change', `${current.metrics.weightChange} kg`, `${previous.metrics.weightChange} kg`, '-']
    ];
    
    doc.autoTable({
      startY: 60,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [253, 90, 32] }
    });
    
    doc.save(`AuraFit_${type}_Report.pdf`);
  };

  const handleShareEmail = async (e) => {
    e.preventDefault();
    setSharing(true);
    try {
      await api.shareReport(reportType, shareEmail, reportData);
      alert('Report shared successfully!');
      setShowShareModal(false);
    } catch (err) {
      alert('Failed to share report: ' + err.message);
    } finally {
      setSharing(false);
    }
  };

  if (loading) return (
    <div className="loading-screen" style={{ height: '70vh' }}>
      <div className="aura-pulse">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="loading-text" style={{ marginTop: '16px' }}>SYNCING YOUR INSIGHTS</div>
    </div>
  );

  if (!reportData) return null;

  return (
    <div className="reports-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient page-title">Fitness Insights</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Analyze your progress and hit your goals</p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--card-overlay)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button 
            onClick={() => setReportType('weekly')} 
            className={`btn ${reportType === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Weekly
          </button>
          <button 
            onClick={() => setReportType('monthly')} 
            className={`btn ${reportType === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--aura-gradient)', padding: '12px', borderRadius: '14px', color: 'white' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              {reportType === 'weekly' ? 'Last 7 Days vs Previous' : 'This Month vs Last Month'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Period: {new Date(reportData.current.period.start).toLocaleDateString()} - {new Date(reportData.current.period.end).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={generatePDF} className="btn btn-ghost" style={{ border: '1px solid var(--glass-card-border)', display: 'flex', gap: '8px' }}>
            <Download size={18} /> PDF
          </button>
          <button onClick={() => setShowShareModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Send size={18} /> Share
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard title="Calories Burned" current={reportData.current.metrics.caloriesBurned} previous={reportData.previous.metrics.caloriesBurned} unit="kcal" />
        <StatCard title="Calories In" current={reportData.current.metrics.caloriesConsumed} previous={reportData.previous.metrics.caloriesConsumed} unit="kcal" inverse={true} />
        <StatCard title="Active Minutes" current={reportData.current.metrics.activeMinutes} previous={reportData.previous.metrics.activeMinutes} unit="min" />
        <StatCard title="Hydration" current={reportData.current.metrics.waterMl} previous={reportData.previous.metrics.waterMl} unit="mL" />
        <StatCard title="Avg Sleep" current={reportData.current.metrics.avgSleep / 60} previous={reportData.previous.metrics.avgSleep / 60} unit="hrs" />
        <StatCard title="Workouts" current={reportData.current.metrics.workoutCount} previous={reportData.previous.metrics.workoutCount} unit="sessions" />
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 400px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--color-orange)" /> Achievement Summary
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--glass-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weight Goal Progress</span>
              <span style={{ fontWeight: '800' }}>{reportData.current.metrics.weightChange > 0 ? '+' : ''}{reportData.current.metrics.weightChange} kg</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--glass-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Protein Intake</span>
              <span style={{ fontWeight: '800' }}>{Math.round(reportData.current.metrics.protein)}g</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--glass-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mindfulness Practice</span>
              <span style={{ fontWeight: '800' }}>{reportData.current.metrics.mindfulnessMinutes} min</span>
            </li>
          </ul>
        </div>
      </div>

      {showShareModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '32px', border: '1px solid var(--color-orange)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '12px' }}>Share Report</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>We'll generate a PDF and send it to the email address below.</p>
            
            <form onSubmit={handleShareEmail}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="glass-input" 
                    value={shareEmail} 
                    onChange={e => setShareEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', paddingLeft: '40px' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowShareModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={sharing} className="btn btn-primary" style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {sharing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} {sharing ? 'Sending...' : 'Send Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
