import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

/**
 * SafeAnimation loads Lottie JSON files dynamically.
 * This prevents the app from crashing by loading large JSON files only when needed.
 */
const SafeAnimation = ({ animationName, fallbackIcon, size = '100%' }) => {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Dynamic import to keep the initial bundle small
    const loadAnim = async () => {
      try {
        // We use a relative path from this component to the assets
        const module = await import(`../assets/workout-animations/${animationName}.json`);
        if (isMounted) {
          setAnimationData(module.default);
        }
      } catch (err) {
        console.error(`Could not load animation: ${animationName}`, err);
        if (isMounted) setError(true);
      }
    };

    loadAnim();
    return () => { isMounted = false; };
  }, [animationName]);

  // If loading or error, show the fallback static icon
  if (error || !animationData) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={fallbackIcon} alt="" style={{ width: '50%', opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default SafeAnimation;
