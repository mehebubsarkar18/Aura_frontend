import { Dumbbell, ArrowRight, ShieldCheck, Activity, Heart, Droplet, TrendingUp, Flame } from 'lucide-react';
import WorkoutAnimation from './WorkoutAnimation';

// Import Lottie animations
import jumpingJacksAnim from '../assets/workout-animations/jumping_jacks.json';
import pushUpsAnim from '../assets/workout-animations/push_ups.json';

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Background Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 8%',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: 'var(--aura-gradient)', 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--aura-glow)'
          }}>
            <Dumbbell size={16} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em' }}>AuraFit</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="nav-buttons-mobile">
          <button 
            onClick={onLogin}
            className="btn btn-ghost landing-nav-btn"
            style={{ fontSize: '0.9rem', padding: '8px 18px' }}
          >
            Login
          </button>
          <button 
            onClick={onGetStarted}
            className="btn btn-primary landing-nav-btn"
            style={{ 
              padding: '8px 22px',
              fontSize: '0.9rem'
            }}
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '40px 8% 80px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }} className="hero-split">
        <style>{`
          @media (max-width: 768px) {
            .landing-nav-btn {
              padding: 4px 10px !important;
              font-size: 0.65rem !important;
            }
            .nav-buttons-mobile {
              gap: 6px !important;
            }
            .hero-trial-btn {
              display: none !important;
            }
          }
          @media (max-width: 1100px) {
            .hero-split {
              grid-template-columns: 1fr !important;
              text-align: center !important;
              padding-top: 15px !important;
            }
            .hero-content {
              align-items: center !important;
            }
            .visual-container {
              justify-content: center !important;
              margin-top: 30px !important;
            }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>

        <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h1 className="text-gradient" style={{ 
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', 
            fontWeight: '800', 
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-0.04em'
          }}>
            Level Up Your <br />
            Fitness <span style={{ color: 'var(--color-orange)' }}>Aura.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', 
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Experience the future of personal training. AuraFit combines precision tracking with a stunning interface to help you achieve your peak physical state.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }} className="hero-trial-btn">
            <button 
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ 
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              Start Free Trial <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Visual Content */}
        <div className="visual-container" style={{ 
          position: 'relative', 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {/* Main Dashboard Card */}
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '320px',
            height: '240px',
            padding: '16px',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'float-slow 6s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 3 }}>
              <div style={{ height: '7px', width: '70px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <div style={{ height: '14px', width: '14px', background: 'var(--color-orange)', borderRadius: '4px' }} />
            </div>
            
            <WorkoutAnimation animationData={jumpingJacksAnim} size="180px" style={{ opacity: 0.8 }} />

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(90deg, transparent, rgba(253, 90, 32, 0.1), transparent)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'var(--color-orange)', opacity: 0.2, clipPath: 'polygon(0 50%, 20% 40%, 40% 60%, 60% 30%, 80% 50%, 100% 20%, 100% 100%, 0 100%)' }} />
            </div>
          </div>

          {/* Floating Card: Activity */}
          <div className="glass-panel" style={{
            position: 'absolute',
            top: '10%',
            right: '-2%',
            padding: '10px 14px',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'float-medium 5s ease-in-out infinite',
            background: 'rgba(13, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px'
          }}>
            <div style={{ background: 'var(--color-green)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={12} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>DAILY CALS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>2,450 kcal</div>
            </div>
          </div>

          {/* Floating Card: Workout Streak */}
          <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '15%',
            left: '-8%',
            padding: '10px 14px',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'float-fast 4s ease-in-out infinite',
            background: 'rgba(13, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px'
          }}>
            <div style={{ background: 'var(--color-orange)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={12} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>STREAK</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>12 Days</div>
            </div>
          </div>

          {/* Decorative Card: Icon-Based Workout */}
          <div style={{
            position: 'absolute',
            top: '-5%',
            left: '5%',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            overflow: 'hidden',
            zIndex: 3,
            boxShadow: '0 12px 28px rgba(253, 90, 32, 0.25)',
            transform: 'rotate(-8deg)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(253, 90, 32, 0.2) 0%, rgba(253, 90, 32, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'float-medium 5s ease-in-out infinite'
          }}>
            <WorkoutAnimation animationData={pushUpsAnim} size="80px" />
          </div>

          {/* Decorative Card: Healthy Diet */}
          <div style={{
            position: 'absolute',
            bottom: '-5%',
            right: '10%',
            width: '110px',
            height: '80px',
            borderRadius: '14px',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: '0 12px 25px rgba(0,0,0,0.3)',
            transform: 'rotate(8deg)',
            opacity: 0.7,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80" 
              alt="Healthy Diet" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '60px 8%',
        background: 'rgba(255, 255, 255, 0.01)',
        borderTop: '1px solid var(--glass-card-border)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.03em' }}>Built for Performance</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Our integrated approach ensures every aspect of your fitness journey is optimized and tracked with military precision.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {[
            { 
              icon: Dumbbell, 
              title: 'Smart Workouts', 
              desc: 'Choose from specialized HIIT, Strength, and Yoga routines with real-time tracking and intensity analysis.',
              color: 'var(--color-orange)'
            },
            { 
              icon: Droplet, 
              title: 'Dynamic Nutrition', 
              desc: 'Macro tracking and hydration monitoring with smart reminders and insights.',
              color: 'var(--color-cyan)'
            },
            { 
              icon: Heart, 
              title: 'Holistic Wellness', 
              desc: 'Track sleep, stress, and mood to build a resilient mind and body.',
              color: 'hsl(340, 90%, 50%)'
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', textAlign: 'left', border: '1px solid var(--glass-card-border)' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: feature.color,
                border: `1px solid ${feature.color}20`
              }}>
                <feature.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '10px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '80px 8%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="glass-panel" style={{
          padding: '48px 32px',
          maxWidth: '900px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(253, 90, 32, 0.08) 0%, rgba(13, 17, 23, 0.4) 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '28px'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.04em' }}>Transform Today.</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Stop guessing and start tracking. Join the AuraFit community and take control of your physical evolution.
            </p>
            <button 
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '16px 48px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto', cursor: 'pointer', pointerEvents: 'auto' }}
            >
              <Dumbbell size={22} color="white" strokeWidth={2.5} />
              Join AuraFit Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 8% 32px',
        borderTop: '1px solid var(--glass-card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--color-orange), hsl(340, 90%, 50%))', 
              width: '24px', 
              height: '24px', 
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.02em' }}>AuraFit</span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <ShieldCheck size={18} color="var(--text-muted)" />
            <Activity size={18} color="var(--text-muted)" />
            <Heart size={18} color="var(--text-muted)" />
          </div>
        </div>
        
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Dumbbell size={10} color="var(--text-muted)" strokeWidth={2} />
          &copy; 2026 AuraFit Digital Systems. Elevate Your Potential.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
