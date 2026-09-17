import React from 'react';
import { ShoppingBag } from 'lucide-react';

const ModernCard = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative bg-[#0A0A0A] rounded-[24px] p-10 sm:p-12 lg:p-[60px] shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-out overflow-hidden">
        
        {/* Background Shopping Bag Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] opacity-[0.08] z-0">
          <ShoppingBag 
            size={280} 
            className="text-red-600 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          />
        </div>

        {/* Gradient Overlay for Premium Feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-900/20 pointer-events-none z-0" />
        
        {/* Subtle Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center h-full">
          
          {/* LIVE NOW Badge */}
          <div className="mb-6 inline-block">
            <span className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full tracking-wider uppercase">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              LIVE NOW
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-white font-extrabold leading-tight mb-6 uppercase tracking-tight">
            <span className="block text-4xl sm:text-5xl lg:text-6xl">
              THE ART
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl">
              SUPPLY STORE
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-lg mb-8 leading-relaxed">
            Professional grade brushes, canvases, and tools delivered across India with exclusive artist discounts.
          </p>

          {/* CTA Button */}
          <button className="group inline-flex items-center text-red-500 font-bold text-lg hover:text-red-400 transition-all duration-200 hover:translate-x-1">
            <span className="mr-2">GO SHOPPING</span>
            <svg 
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
};

export default ModernCard;
