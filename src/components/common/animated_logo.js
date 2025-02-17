import React from 'react';
import Lottie from 'lottie-react';

const AnimatedLogo = ({ className }) => {
  return (
    <div className={className}>
      <Lottie
        animationData={require('../../assets/animations/logo.json')}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default AnimatedLogo; 