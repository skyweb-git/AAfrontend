import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ size = 200, className = "", dark = false }) => {
  const scale = size / 200;
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <DotLottieReact
        src="https://lottie.host/f2532267-d232-41fb-b989-3b5e4ec9a0dc/wiPR1qaQ0J.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
      <div className="text-center" style={{ marginTop: 8 * scale }}>
        <div style={{ 
          fontFamily: "'Lato', sans-serif", 
          fontWeight: 400, 
          fontSize: 13 * scale, 
          letterSpacing: 6 * scale, 
          textTransform: 'uppercase', 
          color: dark ? '#fff' : '#1a1a1a', 
          marginBottom: 2 * scale,
          opacity: 0.8
        }}>
          Art
        </div>
        <div style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontStyle: 'italic', 
          fontSize: 34 * scale, 
          color: '#e8272d', 
          letterSpacing: 1 * scale,
          opacity: 0.9
        }}>
          Artist
        </div>
      </div>
    </div>
  );
};

export default Loader;

