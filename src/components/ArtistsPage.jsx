import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, MapPin, Palette, UserCheck, ArrowRight, Check } from 'lucide-react';
import Navbar from './Navbar';
import { artistsAPI } from '../services/api';
import SEO from './SEO';
import Loader from './Loader';
import Footer from './Footer';
import Chatbot from './Chatbot';
// import ComingSoonBanner from './ComingSoonBanner';
import Cards from './Cards';
import API_URL from '../config';

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [heroImage, setHeroImage] = useState('');
  const [titleText, setTitleText] = useState('Discover Amazing Artists');
  const [titleType, setTitleType] = useState('text');
  const [subtitleText, setSubtitleText] = useState('Search by artist name, art form, or location to find talented creators across India');
  const [titleAccentColor, setTitleAccentColor] = useState('#D71920');
  const [subtitleColor, setSubtitleColor] = useState('#6B7280');
  const [artistCount, setArtistCount] = useState(0);

  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      if (!search.trim()) {
        if (!cancelled) {
          setArtists([]);
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const res = await artistsAPI.searchArtists({ q: search.trim(), limit: 100 });
        if (!cancelled) setArtists(res.artists || []);
      } catch (e) {
        if (!cancelled) setArtists([]);
        console.error('ArtistsPage fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    const t = setTimeout(fetch, search.trim() ? 400 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        let data;
        let initiatedFetch = false;
        // 1. Check in-memory promise coalescer
        if (window.__activeAnnouncementPromise) {
          data = await window.__activeAnnouncementPromise;
        } else {
          // 2. Initiate request and coalesce
          initiatedFetch = true;
          window.__activeAnnouncementPromise = (async () => {
            const response = await fetch(`${API_URL}/announcements/active`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })();
          data = await window.__activeAnnouncementPromise;
        }

        if (data) {
          const announcement = data.data || data;
          if (announcement.heroLogo) {
            const imageUrl = announcement.heroLogo.includes('cloudinary')
              ? `${announcement.heroLogo}?t=${Date.now()}`
              : announcement.heroLogo;
            setHeroImage(imageUrl);
          }
          if (announcement.titleText) {
            setTitleText(announcement.titleText);
          }
          if (announcement.titleType) {
            setTitleType(announcement.titleType);
          }
          if (announcement.subtitleText) {
            setSubtitleText(announcement.subtitleText);
          }
          if (announcement.titleAccentColor) {
            setTitleAccentColor(announcement.titleAccentColor);
          }
          if (announcement.subtitleColor) {
            setSubtitleColor(announcement.subtitleColor);
          }
        }

        if (initiatedFetch) {
          setTimeout(() => {
            window.__activeAnnouncementPromise = null;
          }, 1000);
        }
      } catch (err) {
        window.__activeAnnouncementPromise = null;
        console.error('Hero image fetch error:', err);
      }
    };

    if (API_URL) {
      fetchHeroImage();
    }

    const fetchCount = async () => {
      try {
        // 1. Check in-memory promise coalescer
        if (window.__artistCountPromise) {
          const res = await window.__artistCountPromise;
          if (res && res.success) {
            setArtistCount(res.artistCount || 0);
          }
          return;
        }

        // 2. Check session storage cache
        const cached = sessionStorage.getItem('artist_count_summary');
        if (cached) {
          setArtistCount(parseInt(cached, 10));
          return;
        }

        // 3. Initiate request and coalesce
        window.__artistCountPromise = artistsAPI.getArtistCountSummary();
        const res = await window.__artistCountPromise;
        if (res && res.success) {
          setArtistCount(res.artistCount || 0);
          sessionStorage.setItem('artist_count_summary', String(res.artistCount || 0));
        }
      } catch (err) {
        window.__artistCountPromise = null;
        console.error('Failed to fetch artist count:', err);
      }
    };
    fetchCount();
  }, []);

  return (
    <>
      <SEO 
        title="Indian Artists - ArtArtist"
        description="Explore profiles of talented Indian artists across various art forms. Connect with artists, view portfolios, and commission custom artwork."
        keywords="indian artists, artist profiles, find artists, artist directory, commission art"
        canonical="https://artartist.com/artists"
      />
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Navbar />

        {/* Dynamic Header Area */}
        <div className={`bg-white transition-all duration-700 ease-in-out border-b border-gray-100 ${!search.trim() ? 'pt-10 pb-4 md:pt-16 md:pb-6' : 'py-6 sticky top-0 z-40 shadow-sm'}`}>
          <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
            
            {/* Back button removed as this is now the landing page */}
            
            {/* Big Logo / Title (Only visible when no search query) */}
            {!search.trim() && (
              <div className="text-center mb-8 transform transition-all duration-700">
                {titleType === 'image' && heroImage ? (
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src={heroImage}
                      alt="ArtArtist"
                      className="max-h-32 md:max-h-48 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        setTitleType('text');
                      }}
                    />
                  </div>
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 pb-1">
                    {(() => {
                      const words = titleText.split(' ');
                      if (words.length <= 1) {
                        return <span style={{ color: titleAccentColor }}>{titleText}</span>;
                      }
                      const lastWord = words[words.length - 1];
                      const otherWords = words.slice(0, -1).join(' ');
                      return (
                        <>
                          <span className="text-black">{otherWords} </span>
                          <span style={{ color: titleAccentColor }}>{lastWord}</span>
                        </>
                      );
                    })()}
                  </h1>
                )}
                <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto" style={{ color: subtitleColor }}>
                  {subtitleText}
                </p>
              </div>
            )}

            {/* Google-style Search Bar */}
            <div className="relative w-full max-w-3xl transform transition-all duration-500 z-50">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Hire an Artist by Name, Art Form, or City..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="block w-full pl-16 pr-16 py-4 md:py-5 bg-white border border-gray-200 rounded-full shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all duration-300 text-lg md:text-xl text-gray-800 placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button 
                  onClick={startListening}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isListening 
                      ? 'text-red-600 bg-red-50 animate-pulse shadow-inner' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                  title="Search by voice"
                >
                  <Mic className={`h-6 w-6 ${isListening ? 'scale-110' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stats Row Styled Like About Page */}
            <div className="mt-8 flex items-center justify-center gap-8 sm:gap-16 text-center animate-fade-in z-40">
              <div className="transition-transform duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight mb-1">{artistCount ? artistCount * 50 : '100+'}</div>
                <div className="text-gray-500 font-semibold text-xs sm:text-sm tracking-wide">Arts</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="transition-transform duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight mb-1">{artistCount || 400}</div>
                <div className="text-gray-500 font-semibold text-xs sm:text-sm tracking-wide">Artists</div>
              </div>
            </div>
            
          </div>
        </div>

        <style>
          {`
            .hover-scale { transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 500ms ease; }
            .hover-scale:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            .image-scale { transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1); }
            .image-container:hover .image-scale { transform: scale(1.08); }
            .animation-fade-in { animation: fadeIn 0.8s ease-out forwards; }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>

        {/* Main Content Area */}
        <div className={`flex-grow max-w-7xl mx-auto w-full px-4 ${!search.trim() ? 'py-0' : 'py-8 md:py-12'}`}>
          {!search.trim() ? (
            /* Empty State */
            <div className="max-w-5xl mx-auto pt-8 pb-4 md:py-12">
              {/* Become a Verified Artist Card */}
              <div className="relative bg-[#0A0A0A] rounded-[24px] p-8 sm:p-12 lg:p-16 shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] opacity-[0.08] z-0">
                  <UserCheck 
                    size={280} 
                    className="text-red-600 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-900/20 pointer-events-none z-0" />
                
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                  }}
                />

                <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Title, description, stats, CTA */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="mb-6 inline-block">
                      <span className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full tracking-wider uppercase">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        join as the member
                      </span>
                    </div>

                    <h1 className="text-white font-extrabold leading-tight mb-6 uppercase tracking-tight">
                      <span className="block text-3xl sm:text-4xl lg:text-5xl">
                        BECOME A
                      </span>
                      <span className="block text-3xl sm:text-4xl lg:text-5xl text-brand">
                        VERIFIED ARTIST
                      </span>
                    </h1>

                    <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-lg mb-8 leading-relaxed font-medium">
                      Join {artistCount || 265}+ verified professionals and get high-quality client leads with zero commission.
                    </p>

                    <div className="flex gap-4 sm:gap-6 mb-8 flex-wrap">
                      <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl min-w-[120px] backdrop-blur-sm">
                        <div className="text-2xl font-black text-white">₹1000</div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-wider">LIFETIME</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl min-w-[120px] backdrop-blur-sm">
                        <div className="text-2xl font-black text-white">0%</div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-wider">COMMISSION</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/artist-hub')}
                      className="group inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 font-bold rounded-2xl hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/20 active:scale-95 w-fit"
                    >
                      <span>REGISTER PROFILE</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Right Column: Benefits Checklist */}
                  <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
                    <h3 className="text-white font-extrabold text-lg sm:text-xl mb-6 tracking-wide uppercase">
                      Member Perks
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-brand" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm sm:text-base leading-snug">Personalized Portfolio</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-normal font-medium">Showcase your creative masterpieces on a dedicated page.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-brand" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm sm:text-base leading-snug">Access to Search</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-normal font-medium">Get discovered by buyers looking for custom artwork.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-brand" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm sm:text-base leading-snug">Upload & Post Art</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-normal font-medium">Share your gallery and update your portfolio anytime.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-brand" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm sm:text-base leading-snug">Direct Fan Messages</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-normal font-medium">Receive direct inquiries and notes from fans and clients.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check size={12} className="text-brand" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm sm:text-base leading-snug">Connect with Artists</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 leading-normal font-medium">Interact and network with fellow verified professionals.</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          ) : loading ? (

            /* Loading State */
            <div className="flex flex-col items-center justify-center py-24">
              <Loader size={120} />
              <p className="text-gray-500 font-medium mt-4">Searching for artists...</p>
            </div>
          ) : artists.length === 0 ? (

            /* No Results State */
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto mt-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No artists found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn't find any artists matching "{search}". Try searching for a different name, art form, or city.
              </p>
              <button 
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Clear Search
              </button>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {artists.map((artist) => (
                <div 
                  key={artist._id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover-scale group"
                >
                  <div className="relative overflow-hidden image-container">
                    <img 
                      src={artist?.image?.url || '/default-artist-avatar.png'}
                      alt={artist.name || "Profile"} 
                      className="w-full aspect-square object-cover image-scale bg-gray-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white drop-shadow-md tracking-wide">{artist.name}</h2>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-3 mb-6">
                      {artist.artistNumber && (
                        <div className="text-xs font-bold text-red-600">
                          <span>ID: #{artist.artistNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Palette size={16} className="text-red-500" />
                        <span className="font-medium text-gray-800">{artist.artForm || 'Artist'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{[artist.location?.city, artist.location?.state].filter(Boolean).join(', ') || 'India'}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        console.log('Artist data:', artist);
                        const artistId = artist._id || artist.id || artist.name?.replace(/\s+/g, '-').toLowerCase();
                        console.log('Artist ID:', artistId);
                        if (artistId) {
                           navigate(`/artist/${artistId}`);
                        } else {
                           alert('Artist ID not found');
                        }
                      }}
                      className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 text-sm font-semibold
                               transition-all duration-300 hover:bg-red-600 shadow-md hover:shadow-red-600/30
                               active:scale-95 flex justify-center items-center gap-2"
                    >
                      View Artist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Art Marketplace Section */}
        {/* {!search.trim() && <ComingSoonBanner />} */}

        <Cards hideBecomeVerifiedArtist={true} />

        <Footer />
        <Chatbot />
      </div>
    </>
  );
};

export default ArtistsPage;
