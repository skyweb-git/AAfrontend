import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistsAPI, productsAPI, eventsAPI } from '../services/api';
import API_URL from '../config';
import profileBg from './cropped_circle_image.png';

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ artists: [], products: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroSettings, setHeroSettings] = useState({
    titleType: 'text',
    titleText: 'DISCOVER ART',
    titleAccentColor: '#dc2626',
    subtitleText: '',
    subtitleColor: '#6B7280'
  });
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Use centralized API_URL from config
    const fetchHeroImage = () => {
      fetch(`${API_URL}/announcements/active`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.data) {
            setHeroSettings({
              titleType: data.data.titleType || 'text',
              titleText: data.data.titleText || 'DISCOVER ART',
              titleAccentColor: data.data.titleAccentColor || '#dc2626',
              subtitleText: data.data.subtitleText || '',
              subtitleColor: data.data.subtitleColor || '#6B7280'
            });
            if (data.data.heroLogo) {
              // Add cache-busting parameter to Cloudinary images
              const imageUrl = data.data.heroLogo.includes('cloudinary')
                ? `${data.data.heroLogo}?t=${Date.now()}`
                : data.data.heroLogo;
              setHeroImage(imageUrl);
            } else {
              setHeroImage('');
            }
          }
        })
        .catch((err) => {
          console.error('Hero image fetch error:', err);
          // Don't set hero image on error, fallback to text will show
        });
    };

    if (API_URL) {
      fetchHeroImage();
    }
  }, []);

  useEffect(() => {
    const hasSpeech =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechSupported(Boolean(hasSpeech));

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // no-op
        }
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!searchQuery.trim()) {
        setResults({ artists: [], products: [], events: [] });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const q = searchQuery.trim();
        const [artistsRes, productsRes, eventsRes] = await Promise.allSettled([
          artistsAPI.searchArtists({ q, limit: 5 }),
          productsAPI.getProducts({ search: q, limit: 5 }),
          eventsAPI.getEvents({ search: q, limit: 5 }),
        ]);
        if (cancelled) return;
        setResults({
          artists: artistsRes.status === 'fulfilled' ? (artistsRes.value.artists || []) : [],
          products: productsRes.status === 'fulfilled' ? (productsRes.value.products || []) : [],
          events: eventsRes.status === 'fulfilled' ? (eventsRes.value.events || []) : [],
        });
      } catch (e) {
        if (!cancelled) setResults({ artists: [], products: [], events: [] });
        console.error('Search error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery]);

  const hasAnyResults = useMemo(
    () => results.artists.length > 0 || results.products.length > 0 || results.events.length > 0,
    [results.artists.length, results.products.length, results.events.length]
  );

  const handleMicClick = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechMessage('Voice search is not supported in this browser.');
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setSpeechMessage('Voice search needs HTTPS or localhost.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechMessage('Listening... speak now');
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setSpeechMessage('Microphone permission denied. Please allow mic access.');
      } else if (event?.error === 'no-speech') {
        setSpeechMessage('No speech detected. Try again.');
      } else if (event?.error === 'audio-capture') {
        setSpeechMessage('No microphone detected on this device.');
      } else {
        setSpeechMessage('Voice recognition failed. Please try again.');
      }
    };
    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      const value = String(transcript).trim();
      if (value) {
        setSearchQuery(value);
        setShowSuggestions(true);
        setSpeechMessage(`Heard: "${value}"`);
      } else {
        setSpeechMessage('Could not understand. Please try again.');
      }
    };
    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      setSpeechMessage('Could not start microphone. Try again.');
    }
  };

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Hero Heading */}
        <div className="mb-12">
          {heroSettings.titleType === 'image' && heroImage ? (
            <div className="flex items-center justify-center">
              <img
                src={heroImage}
                alt="ArtArtist"
                className="max-h-48 md:max-h-64 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<h1 class="text-5xl md:text-7xl font-bold mb-4"><span class="text-black">DISCOVER </span><span style="color: ${heroSettings.titleAccentColor}">ART</span></h1>`;
                }}
              />
            </div>
          ) : (
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              {(() => {
                const words = heroSettings.titleText.trim().split(/\s+/);
                if (words.length <= 1) {
                  return <span style={{ color: heroSettings.titleAccentColor }}>{heroSettings.titleText}</span>;
                }
                const lastWord = words.pop();
                const remainingText = words.join(' ');
                return (
                  <>
                    <span className="text-black">{remainingText} </span>
                    <span style={{ color: heroSettings.titleAccentColor }}>{lastWord}</span>
                  </>
                );
              })()}
            </h1>
          )}
        </div>

        {/* Hero Subtitle */}
        {heroSettings.subtitleText && (
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
            style={{ color: heroSettings.subtitleColor }}
          >
            {heroSettings.subtitleText}
          </p>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto text-left">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Hire an Artist by Name, Art Form, or City..."
              className="w-full px-6 py-4 pr-24 text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-red-600 focus:bg-white transition-all"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
              <button
                type="button"
                className={`p-2 transition-colors ${
                  isListening ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
                } ${!speechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={handleMicClick}
                disabled={!speechSupported}
                title={speechSupported ? (isListening ? 'Listening...' : 'Search by voice') : 'Voice search not supported'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            {speechMessage ? (
              <div className="mt-2 px-3 text-xs text-gray-500">{speechMessage}</div>
            ) : null}

            {showSuggestions && searchQuery.trim() && (
              <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {loading ? (
                  <div className="px-4 py-4 text-sm text-gray-500">Searching...</div>
                ) : !hasAnyResults ? (
                  <div className="px-4 py-4 text-sm text-gray-500">No results found.</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {/* Artists */}
                    {results.artists.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Artists</div>
                        {results.artists.map((artist) => (
                          <button
                            key={artist._id}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
                            onClick={() => {
                              setSelectedArtist(artist);
                              setShowSuggestions(false);
                            }}
                          >
                            <img
                              src={artist?.image?.url}
                              alt={artist?.image?.alt || artist?.name}
                              className="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-gray-900 text-base leading-tight">{artist.name}</div>
                              <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-0.5">{artist.artForm}</div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {[artist.location?.city, artist.location?.state, artist.location?.country].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Products / Art */}
                    {results.products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t">Art</div>
                        {results.products.map((product) => (
                          <button
                            key={product._id}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
                            onClick={() => {
                              setShowSuggestions(false);
                              navigate('/art');
                            }}
                          >
                            <img
                              src={product?.images?.[0]?.url}
                              alt={product?.name}
                              className="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-gray-900 text-base leading-tight">{product.name}</div>
                              <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-0.5">{product.category}</div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {product?.artistProfile?.name || product?.artist?.displayName || 'ArtArtist'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Events */}
                    {results.events.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t">Events</div>
                        {results.events.map((event) => (
                          <button
                            key={event._id}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
                            onClick={() => {
                              setShowSuggestions(false);
                              navigate('/events');
                            }}
                          >
                            <img
                              src={event?.images?.[0]?.url}
                              alt={event?.title}
                              className="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-gray-900 text-base leading-tight">{event.title}</div>
                              <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-0.5">
                                {event?.pricing?.type === 'free' ? 'Free' : `₹${Number(event?.pricing?.amount || 0).toLocaleString()}`}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {[event.location?.city, event.location?.state].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
            CANVAS
          </span>
          <span 
            onClick={() => navigate('/nft')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            NFTS
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
            MANDALAS
          </span>
        </div>
      </div>

      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedArtist(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-4 absolute top-0 right-0 z-20">
              <button
                onClick={() => setSelectedArtist(null)}
                className="px-3 py-1 rounded-lg bg-white/90 border hover:bg-white text-sm"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <div className="relative h-40">
                <div className="rounded-3xl overflow-hidden h-full">
                  <img src={profileBg} alt="profile background" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="px-3">
                <div className="-mt-10 relative z-10 flex items-end justify-between">
                  <img
                    src={selectedArtist?.image?.url}
                    alt={selectedArtist?.image?.alt || selectedArtist?.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-gray-100"
                  />
                  <div className="px-3 py-1.5 rounded-full border bg-white shadow-sm text-xs font-semibold text-gray-700">
                    {selectedArtist.artForm}
                  </div>
                </div>

                <div className="mt-3 text-left">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedArtist.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {[selectedArtist.location?.city, selectedArtist.location?.state, selectedArtist.location?.country].filter(Boolean).join(', ')}
                  </div>
                  {selectedArtist.bio ? (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">{selectedArtist.bio}</p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {selectedArtist.social?.instagram ? <a href={selectedArtist.social.instagram} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">Instagram</a> : null}
                  {selectedArtist.social?.facebook ? <a href={selectedArtist.social.facebook} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">Facebook</a> : null}
                  {selectedArtist.social?.twitter ? <a href={selectedArtist.social.twitter.startsWith('http') ? selectedArtist.social.twitter : `https://x.com/${selectedArtist.social.twitter}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">X</a> : null}
                  {selectedArtist.social?.linkedin ? <a href={selectedArtist.social.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">LinkedIn</a> : null}
                  {selectedArtist.social?.website ? <a href={selectedArtist.social.website} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">Website</a> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
