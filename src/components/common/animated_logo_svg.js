import React from 'react';
import trafficGif from '../../assets/images/traffic.gif';
import './animated_logo.css';

const AnimatedLogoSVG = ({ className }) => {
  return (
    <div className={className || "w-full h-full"}>
      <img 
        src={trafficGif} 
        alt="Traffic Logo"
        className="w-full h-full object-contain"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
};

export default AnimatedLogoSVG; 