import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Volume2, VolumeX, Send, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey artist, what's up buddy?",
      audioUrl: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  // Audio and sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  const maxCharCount = 150;

  // Retrieve or generate persistent sessionId
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('uday_session_id');
    if (!id) {
      id = 'session-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('uday_session_id', id);
    }
    return id;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Load chat history from backend on startup
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/chatbot/history?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.history && data.history.length > 0) {
            const mapped = data.history.map(m => ({
              id: m._id,
              role: m.role,
              content: m.content,
              audioUrl: null // loaded messages don't start with playing audio
            }));
            setMessages(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load chat history:", err);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }, []);

  const playChime = useCallback((notes, volume = 0.05) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      notes.forEach(({ freq, at }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + at;
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch (e) {
      console.warn("AudioContext chime failure:", e);
    }
  }, [soundEnabled, getAudioContext]);

  const playSend = useCallback(() => {
    playChime([
      { freq: 523.25, at: 0 },
      { freq: 783.99, at: 0.06 },
    ], 0.04);
  }, [playChime]);

  const playReceive = useCallback(() => {
    playChime([
      { freq: 392.0, at: 0 },
      { freq: 587.33, at: 0.08 },
    ], 0.04);
  }, [playChime]);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.warn(err));
      }
    };
  }, []);

  // Audio event listeners for voice cloning outputs
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPause = () => setPlayingMessageId(null);
    const onEnded = () => setPlayingMessageId(null);

    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [activeAudioUrl]);

  // Play audio for a specific message
  const playAudio = (messageId, url) => {
    if (!url) return;

    if (playingMessageId === messageId) {
      audioRef.current.pause();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      setActiveAudioUrl(url);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(e => {
            console.error("Playback failed:", e);
            setPlayingMessageId(null);
          });
        }
      }, 50);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const queryText = inputMessage.trim();
    if (!queryText || isLoading) return;

    // Play send audio chime
    playSend();

    const userMsgId = 'user-' + Date.now();
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    setStatusText('Thinking...');

    // Dynamic loading text updates
    const statusMessages = [
      'Formulating response...',
      'Synthesizing voice via Cartesia AI...',
      'Delivering cloned voice...'
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < statusMessages.length - 1) {
        msgIdx++;
        setStatusText(statusMessages[msgIdx]);
      }
    }, 2000);

    try {
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ 
          message: queryText,
          sessionId: sessionId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Server failed to process query.');
      }

      // Play receive audio chime
      playReceive();

      const botMsgId = 'bot-' + Date.now();
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: data.reply || data.response || data.text,
        audioUrl: data.audioUrl
      };

      setMessages(prev => [...prev, botMsg]);

      // Auto-play the response voice if enabled
      if (data.audioUrl && soundEnabled) {
        playAudio(botMsgId, data.audioUrl);
      }

    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err.message || 'Sorry, I could not connect to the server. Please try again.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const hasText = inputMessage.trim().length > 0;

  return (
    <>
      {/* Hidden global audio element */}
      <audio ref={audioRef} src={activeAudioUrl} />

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center bg-transparent border-0 p-0"
        style={{ width: '80px', height: '80px' }}
      >
        {isOpen ? (
          <div className="w-12 h-12 rounded-full bg-[#0b0f19] border border-red-600 flex items-center justify-center shadow-lg transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          <DotLottieReact
            src="https://lottie.host/a81d0278-d4eb-4e60-98a9-841bbac3a526/Hylw7g1fdP.lottie"
            loop
            autoplay
            speed={1}
            style={{ width: '80px', height: '80px' }}
          />
        )}
      </button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="chatbot-container fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-800"
            style={{ height: '550px', maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Background glowing effects */}
            <div className="bg-glow bg-glow-1"></div>
            <div className="bg-glow bg-glow-2"></div>

            {/* Header */}
            <div className="z-10 bg-black/60 backdrop-blur-md border-b border-white/5 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img 
                    src="/uday_dp.jpeg" 
                    alt="Uday AI" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '🤖';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white uppercase" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    Uday <span className="text-red-500">(ARTARTIST)</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-emerald-500 tracking-wide uppercase">Online</span>
                  </div>
                </div>
              </div>

              {/* Sound Settings button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-neutral-400 hover:text-white"
                title={soundEnabled ? "Mute voice" : "Unmute voice"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Messages Viewport */}
            <div className="chatbot-messages-container z-10 flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/20">
              {messages.length === 0 && (
                <div className="text-center text-neutral-400 mt-16 px-4">
                  <p className="text-sm font-bold">Hello artist, what's up buddy?</p>
                  <p className="text-xs mt-2 text-neutral-500">I am Uday, your AI Digital Twin. Ask me about paintings, exhibitions, or creative updates!</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id || Math.random()}
                  className={`flex gap-2.5 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                      <img 
                        src="/uday_dp.jpeg" 
                        alt="Uday" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '🤖';
                        }}
                      />
                    </div>
                  )}

                  <div
                    onClick={() => {
                      if (msg.role === 'assistant' && msg.audioUrl) {
                        playAudio(msg.id, msg.audioUrl);
                      }
                    }}
                    className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md border transition-all ${
                      msg.role === 'user'
                        ? 'bg-white/5 border-white/10 text-white rounded-tr-none'
                        : 'bg-primary border-primary/20 text-white rounded-tl-none hover:opacity-95 cursor-pointer active:scale-[0.99]'
                    }`}
                    title={msg.role === 'assistant' && msg.audioUrl ? "Tap to speak out" : undefined}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Visualizer when speaking */}
                    {msg.audioUrl && playingMessageId === msg.id && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 select-none">
                        <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Speaking</span>
                        <div className="bubble-mini-visualizer">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 w-full justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <img 
                      src="/uday_dp.jpeg" 
                      alt="Uday" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '🤖';
                      }}
                    />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3 bg-primary border border-primary/20 text-white shadow-md flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] text-white/70 font-medium tracking-wide">{statusText}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center w-full">
                  <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold shadow-md">
                    ⚠️ {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Panel */}
            <form onSubmit={handleSendMessage} className="z-10 p-3 bg-black/60 border-t border-white/5 flex gap-2 items-center">
              <button
                type="button"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-neutral-400 hover:text-white"
                aria-label="Add attachment"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= maxCharCount) {
                      setInputMessage(e.target.value);
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Ask Uday about art..."
                  className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-neutral-700 text-xs text-white placeholder-neutral-500"
                />
                <div className="absolute right-2.5 text-[9px] text-white/20 select-none">
                  {inputMessage.length}/{maxCharCount}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 ${
                  hasText 
                    ? 'bg-primary text-white hover:opacity-90 shadow-md' 
                    : 'bg-white/5 text-white/25 cursor-not-allowed border border-white/5'
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
