import Lottie from 'lottie-react';

const WorkoutAnimation = ({ animationData, size = '100%', style = {} }) => {
  if (!animationData) return null;
  
  return (
    <div style={{ 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      ...style 
    }}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default WorkoutAnimation;
