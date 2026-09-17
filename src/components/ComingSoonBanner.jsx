import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { waitlistAPI } from '../services/api';
import banner1 from '../assets/banner/banner-1.jpeg';
import banner2 from '../assets/banner/banner-2.jpeg';
import banner3 from '../assets/banner/banner-3.jpeg';
import banner4 from '../assets/banner/banner-4.jpeg';

const ComingSoonBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    
    const targetEmail = isAuthenticated ? user.email : email;
    
    if (!targetEmail) {
      alert('Please provide an email address');
      return;
    }

    try {
      setLoading(true);
      await waitlistAPI.join({ email: targetEmail });
      setIsJoined(true);
      // Feedback duration
      setTimeout(() => {
        setIsJoined(false);
        setEmail('');
      }, 5000);
    } catch (error) {
      console.error('Waitlist error:', error);
      if (error.response?.status === 409 || error.response?.data?.error?.toLowerCase().includes('already')) {
        alert('You are already on the waitlist!');
      } else {
        alert(error.response?.data?.error || 'Failed to join waitlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white pt-4 pb-4 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] bg-gradient-to-br from-gray-900 via-black to-red-950 p-1 md:p-2 shadow-2xl">
            <div className="relative rounded-[2.8rem] bg-[#050505] overflow-hidden p-6 sm:p-8 md:p-20 pb-16">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 mb-6 sm:mb-8 max-w-full">
                    <Sparkles size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-red-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] truncate">Next Generation Marketplace</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] sm:leading-[0.9] mb-6 sm:mb-8 uppercase tracking-tighter">
                    <span className="text-red-600">Marketplace</span> <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Coming Soon</span>
                  </h2>
                  
                  <p className="text-gray-400 text-base md:text-xl mb-10 sm:mb-12 leading-relaxed max-w-xl font-medium">
                    We are building a revolutionary platform where every brushstroke finds its home. Experience seamless buying, artist royalties, and global shipping.
                  </p>
                
                <form onSubmit={handleJoin} className="space-y-6">
                  {!isAuthenticated && !isJoined && (
                    <div className="max-w-md relative group">
                      <input 
                        type="email" 
                        required
                        placeholder="Enter your email to join" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                  )}

                  {isAuthenticated && !isJoined && (
                    <div className="text-gray-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Logged in as <span className="text-white font-bold">{user.email}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <button 
                      type="submit"
                      disabled={isJoined || loading}
                      className={`group relative px-10 py-5 font-bold rounded-2xl transition-all duration-300 shadow-xl overflow-hidden min-w-[240px] ${
                        isJoined ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                      } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? 'JOINING...' : isJoined ? 'SUCCESSFULLY JOINED!' : 'JOIN THE WAITLIST'}
                        {!isJoined && !loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                      </span>
                      {!isJoined && !loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6 pt-12">
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:scale-105 transition-transform duration-500">
                      <img src={banner1} alt="Art 1" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:scale-105 transition-transform duration-500">
                      <img src={banner2} alt="Art 2" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:scale-105 transition-transform duration-500">
                      <img src={banner3} alt="Art 3" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:scale-105 transition-transform duration-500">
                      <img src={banner4} alt="Art 4" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </div>
                </div>
                
                {/* Feature Tags */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 pointer-events-none">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl -rotate-6">
                    <span className="text-white font-bold text-sm tracking-wider">ZERO COMMISSION</span>
                  </div>
                  <div className="bg-red-600 border border-red-400 px-6 py-3 rounded-2xl shadow-2xl rotate-3 translate-x-12">
                    <span className="text-white font-bold text-sm tracking-wider">GLOBAL SHIPPING</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl -rotate-2 -translate-x-12">
                    <span className="text-white font-bold text-sm tracking-wider">CREATOR ROYALTIES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonBanner;
