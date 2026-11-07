import React from 'react';
import { Lottie } from 'lottie-react';
import loaderAnimation from '../assets/loader-animation.json';

const Loader = ({ size = 200, className = "", dark = false }) => {
  const scale = size / 200;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Lottie
        src={loaderAnimation}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
      <div
        className="text-center font-bold leading-none whitespace-nowrap"
        style={{
          fontFamily: "'League Spartan', sans-serif",
          marginTop: 10 * scale,
          fontSize: 28 * scale,
          letterSpacing: 0.5 * scale,
          fontWeight: 700,
        }}
      >
        <span style={{ color: '#B21717', fontSize: '1em', fontWeight: 700 }}>Art</span>
        <span style={{ color: '#000000', fontSize: '1em', fontWeight: 700 }}>Artist</span>
      </div>
    </div>
  );
};

export default Loader;
