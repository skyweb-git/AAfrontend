import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  PenTool, 
  Globe, 
  TrendingUp, 
  Users, 
  Link as LinkIcon, 
  Eye, 
  Palette, 
  Camera, 
  Mic, 
  Image as ImageIcon, 
  GraduationCap, 
  Feather, 
  Layers, 
  Crown, 
  Sparkles, 
  MapPin 
} from 'lucide-react';
import './ArtDistrict.css';
import { API_URL } from '../config';

const ArtDistrict = () => {
  // Scroll reveal references
  const revealRefs = useRef([]);
  revealRefs.current = [];

  const addToRevealRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // Testimonials track scroll reference
  const trackRef = useRef(null);

  const scrollTrack = (direction) => {
    if (trackRef.current) {
      const scrollAmount = 384; // width of card (360px) + gap (24px)
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // State variables for checkout flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassSelector, setShowPassSelector] = useState(false);

  // Pricing + payment link + gallery loaded from API
  const [passes, setPasses] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [apiGallery, setApiGallery] = useState([]);
  const [stats, setStats] = useState([]);

  // Load config from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const base = API_URL ? API_URL.replace(/\/api$/, '') : 'https://sverxiioo.nanoprofiles.com';
        const res  = await fetch(`${base}/api/art-district/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.passes && Array.isArray(data.passes)) {
            setPasses(data.passes);
          }
          if (data.heroImages && Array.isArray(data.heroImages)) {
            setHeroImages(data.heroImages);
          }
          if (data.testimonials && Array.isArray(data.testimonials)) {
            setTestimonials(data.testimonials);
          }
          if (Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
            setApiGallery(data.galleryImages);
          }
          if (data.stats && Array.isArray(data.stats) && data.stats.length > 0) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.warn('ArtDistrict config fetch failed, using defaults', err);
      }
    };
    fetchConfig();
  }, []);

  // Selected pass configurations
  // We still track selected pass for the modal
  const [selectedPass, setSelectedPass] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    instaHandle: '',
    artCategory: '',
    paymentMethod: 'UPI'
  });

  const [formErrors, setFormErrors] = useState({
    fullName: '',
    emailAddress: '',
    instaHandle: '',
    artCategory: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Dynamic values
  // Dynamic passes are in `passes` state.

  // Helper for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      revealRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);



  // Toast trigger helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };



  // Open / Close modal helpers
  const openModal = (pass) => {
    if (pass?.paymentLink) {
      window.open(pass.paymentLink, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedPass(pass);
    setIsModalOpen(true);
    if (pass) triggerToast(`Configuring your ${pass.title}!`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowPassSelector(false);
  };

  const togglePassSelector = () => {
    setShowPassSelector(!showPassSelector);
  };

  const selectPassOption = (pass) => {
    setSelectedPass(pass);
    setShowPassSelector(false);
    triggerToast(`Switched to ${pass.name}!`);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));

    // Clear validation error on change
    if (formErrors[id]) {
      setFormErrors((prev) => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { fullName: '', emailAddress: '', instaHandle: '', artCategory: '' };

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailAddress.trim() || !emailRegex.test(formData.emailAddress)) {
      errors.emailAddress = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!formData.instaHandle.trim()) {
      errors.instaHandle = 'Instagram handle is required.';
      isValid = false;
    } else if (!formData.instaHandle.startsWith('@')) {
      errors.instaHandle = 'Instagram handle must start with @';
      isValid = false;
    }

    if (!formData.artCategory) {
      errors.artCategory = 'Please select a creative category.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      triggerToast('Please correct validation errors.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build registration data
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const today   = new Date();
      const validFrom = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

      const expiry = new Date();
      if (selectedPass.title.toLowerCase().includes('daily'))       expiry.setDate(today.getDate() + 1);
      else if (selectedPass.title.toLowerCase().includes('weekly')) expiry.setDate(today.getDate() + 7);
      else                                                          expiry.setDate(today.getDate() + 30);
      const validThru = `${expiry.getDate()} ${months[expiry.getMonth()]} ${expiry.getFullYear()}`;

      const names    = formData.fullName.trim().split(' ');
      const initials = names.length > 1
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();

      const randomId = Math.floor(1000 + Math.random() * 9000);
      const memberId = `AA-2026-${randomId}`;

      const qrData  = encodeURIComponent(`ID:${memberId}|Name:${formData.fullName}|Pass:${selectedPass.title}`);
      const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

      const instaHandle = formData.instaHandle.startsWith('@')
        ? formData.instaHandle
        : `@${formData.instaHandle}`;

      const newRegistration = {
        fullName:      formData.fullName,
        email:         formData.emailAddress,
        insta:         instaHandle,
        category:      formData.artCategory,
        passType:      selectedPass.title,
        price:         selectedPass.price,
        initials,
        memberId,
        validFrom,
        validThru,
        qrCodeUrl:     qrUrl,
        paymentMethod: formData.paymentMethod
      };

      // Save to MongoDB via API
      const base = API_URL ? API_URL.replace(/\/api$/, '') : 'https://sverxiioo.nanoprofiles.com';
      const res  = await fetch(`${base}/api/art-district/registrations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newRegistration)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save registration');
      }

      setGeneratedPass(newRegistration);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setIsSuccessOpen(true);
      triggerToast('Pass created! Redirecting to payment…');

      // Redirect to payment link (opens in new tab so pass screen stays visible)
      if (selectedPass.paymentLink) {
        setTimeout(() => window.open(selectedPass.paymentLink, '_blank', 'noopener,noreferrer'), 1200);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setIsSubmitting(false);
      triggerToast(`Error: ${err.message}`);
    }
  };

  // Close success screen and cleanup
  const closeSuccessOverlay = () => {
    setIsSuccessOpen(false);
    setFormData({
      fullName: '',
      emailAddress: '',
      instaHandle: '',
      artCategory: '',
      paymentMethod: 'UPI'
    });
    setGeneratedPass(null);
  };

  // Scroll to passes section
  const scrollToPasses = () => {
    const target = document.getElementById('passes');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadPassPdf = () => {
    triggerToast('Downloading digital pass as PDF...');
    // Create print operation
    window.print();
  };

  return (
    <>
      <Navbar />

      {/* Global alert toast notification */}
      <div className={`toast-district ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      <div className="noise-overlay"></div>

      {/* ═══ HERO SECTION ═══ */}
      <section id="hero-district">
        <div className="brush-bg">
          <svg className="brush-svg brush-1" viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M460 20 C380 10, 200 60, 20 200 C60 180, 300 90, 460 20Z" fill="#D71920" opacity=".18"/>
            <path d="M440 60 C360 50, 180 100, 10 240 C50 220, 280 130, 440 60Z" fill="#D71920" opacity=".10"/>
            <path d="M400 30 C320 20, 140 80, 20 180 C60 160, 260 70, 400 30Z" fill="#D71920" opacity=".06"/>
          </svg>
          <svg className="brush-svg brush-2" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M320 20 C240 10, 100 60, 10 200 C50 175, 220 80, 320 20Z" fill="#D71920" opacity=".15"/>
            <path d="M300 50 C220 40, 80 90, 10 180" stroke="#D71920" strokeWidth="8" strokeLinecap="round" opacity=".12"/>
          </svg>
          <svg className="brush-svg brush-3" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 30 C60 10, 140 50, 190 30" stroke="#D71920" strokeWidth="12" strokeLinecap="round" opacity=".2"/>
          </svg>
        </div>

        <div className="hero-left">
          <div className="hero-co-badge">
            <img src="/art-district-logo.png" alt="ArtDistrict x Cohort Logo" className="hero-co-logo" />
            <div className="hero-co-divider"></div>
            <span className="hero-co-location">COHORT × ARTARTIST</span>
          </div>

          <div className="hero-editorial-flow">
            <span className="hero-editorial-tag">FOR THOSE WHO CREATE</span>
            <h1 className="hero-editorial-h1">
              <span className="blk line-1 animate-reveal-1">NOT JUST</span>
              <span className="red-brand line-2 animate-reveal-2">CONSUME.</span>
              <span className="blk line-3 spacer animate-reveal-3">INDIA’S FIRST</span>
              <span className="blk line-4 animate-reveal-4">CO-CREATIVE</span>
              <span className="red-brand line-5 animate-reveal-5">ECOSYSTEM</span>
              <span className="red-brand line-6 animate-reveal-6">FOR ARTISTS.</span>
            </h1>
            <p className="hero-editorial-p">
              Join ArtDistrict and be part of Hyderabad’s growing creative movement. A place where artists connect, collaborate, exhibit, and grow together.
            </p>
          </div>

          <div className="hero-btns">
            <button className="btn-primary" onClick={scrollToPasses}>Explore Passes</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-grid">
            <div className="hero-img hero-img-1">
              <img src={heroImages[0] || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80"} alt="Artist sketching" loading="lazy"/>
            </div>
            <div className="hero-img hero-img-2">
              <img src={heroImages[1] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80"} alt="Art collaboration" loading="lazy"/>
            </div>
            <div className="hero-img hero-img-3 span2">
              <img src={heroImages[2] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80"} alt="Creative studio" loading="lazy"/>
            </div>
            <div className="hero-img hero-img-4">
              <img src={heroImages[3] || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80"} alt="Workshop" loading="lazy"/>
            </div>
            <div className="hero-img hero-img-5">
              <img src={heroImages[4] || "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=600&q=80"} alt="Gallery moment" loading="lazy"/>
            </div>
          </div>
          <div className="hero-stat-bar">
            {stats.length > 0 ? (
              stats.map((stat, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-num">{stat.num}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))
            ) : (
              <>
                <div className="hero-stat">
                  <span className="hero-stat-num">450+</span>
                  <span className="hero-stat-label">Artists</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">20+</span>
                  <span className="hero-stat-label">Events</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">₹0</span>
                  <span className="hero-stat-label">Commission</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">01</span>
                  <span className="hero-stat-label">Ecosystem</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══ CONTINUOUS TAGLINES TICKER ═══ */}
      <div className="tagline-ticker-container">
        <div className="tagline-ticker-track">
          <span>A Space That Creates Culture</span>
          <span>Not A Workspace. A Creative Ecosystem</span>
          <span>Artists Don’t Need Offices. They Need A District</span>
          <span>The Future Of Creative Communities</span>
          <span>Hyderabad’s Creative Home</span>
          <span>Create Together</span>
          <span>Creativity Feels Different Here</span>
          <span>Culture Starts Here</span>
          <span>Where Creativity Lives</span>
          <span>Built By Artists</span>
          {/* Duplicate for seamless infinite marquee loop */}
          <span>A Space That Creates Culture</span>
          <span>Not A Workspace. A Creative Ecosystem</span>
          <span>Artists Don’t Need Offices. They Need A District</span>
          <span>The Future Of Creative Communities</span>
          <span>Hyderabad’s Creative Home</span>
          <span>Create Together</span>
          <span>Creativity Feels Different Here</span>
          <span>Culture Starts Here</span>
          <span>Where Creativity Lives</span>
          <span>Built By Artists</span>
        </div>
      </div>

      {/* ═══ POSITIONING SECTION ═══ */}
      <section className="positioning-section reveal" ref={addToRevealRefs}>
        <div className="positioning-inner">
          <span className="positioning-tagline">Positioning Statement</span>
          <h2 className="positioning-h2">
            The Future Of Creative Spaces <span>Starts Here.</span>
          </h2>
          <p className="what-desc" style={{ maxWidth: '750px', margin: '0 auto 40px' }}>
            Cohort × ArtDistrict is redefining what creative spaces can become.
          </p>
          <div className="positioning-blocks">
            <div className="positioning-block-card">
              <h3>Not Offices.</h3>
              <p>Forget the cubicles and rigid structures of corporate work environments.</p>
            </div>
            <div className="positioning-block-card">
              <h3>Not Studios.</h3>
              <p>More than just four walls of quiet isolation for standalone production.</p>
            </div>
            <div className="positioning-block-card">
              <h3>Not Cafés.</h3>
              <p>Beyond noisy, cramped tables with poor lighting and zero creative support.</p>
            </div>
          </div>
          <div className="positioning-footer-text">
            But living ecosystems where people create together.
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — WHAT IS ARTDISTRICT ═══ */}
      <section id="what">
        <div className="what-left reveal-left" ref={addToRevealRefs}>
          <svg className="what-brush" viewBox="0 0 80 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 10 C20 50, 60 100, 35 150 C15 200, 55 250, 40 290" stroke="#D71920" strokeWidth="6" strokeLinecap="round" opacity=".4"/>
          </svg>
          <h2 className="what-h2">
            NOT A SPACE.<br/>
            AN <span className="red">ECOSYSTEM.</span>
          </h2>
          <div className="what-divider"></div>
          <div className="what-keywords">
            <span className="kw kw-1">CREATE</span>
            <span className="kw kw-2">COLLABORATE</span>
            <span className="kw kw-3">CONNECT</span>
            <span className="kw kw-4">EVOLVE</span>
          </div>
        </div>

        <div className="what-right reveal-right" ref={addToRevealRefs}>
          <p className="what-desc">
            ArtDistrict is a <strong>live co-creative environment</strong> built for painters, sculptors, digital artists, writers, musicians, filmmakers, photographers, designers, and <strong>creators of every kind</strong>.<br/><br/>
            In partnership with <strong>Cohort Co-Working</strong>, we've built more than a space — we've built a living, breathing creative culture inside Hyderabad.
          </p>
          <div className="what-icons stagger" ref={addToRevealRefs}>
            <div className="what-icon-card">
              <span className="what-icon"><PenTool size={22} /></span>
              <div className="what-icon-text">
                <h4>Create</h4>
                <p>Dedicated zones for every art form</p>
              </div>
            </div>
            <div className="what-icon-card">
              <span className="what-icon"><Users size={22} /></span>
              <div className="what-icon-text">
                <h4>Collaborate</h4>
                <p>Find your creative counterpart</p>
              </div>
            </div>
            <div className="what-icon-card">
              <span className="what-icon"><Globe size={22} /></span>
              <div className="what-icon-text">
                <h4>Connect</h4>
                <p>Build a network that matters</p>
              </div>
            </div>
            <div className="what-icon-card">
              <span className="what-icon"><TrendingUp size={22} /></span>
              <div className="what-icon-text">
                <h4>Evolve</h4>
                <p>Grow through community & exposure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT COHORT SECTION ═══ */}
      <section className="about-cohort-section reveal" ref={addToRevealRefs}>
        <div className="about-cohort-grid">
          <div className="about-cohort-left">
            <h2 className="about-cohort-h2">
              Why <span>Cohort?</span>
            </h2>
            <div className="about-cohort-highlight-box">
              <p>
                “Cohort is not just providing space. It is helping build a new creative culture.”
              </p>
            </div>
            <div className="about-cohort-quote">
              “Cohort becomes the space where Hyderabad’s creative culture lives.”
            </div>
          </div>
          
          <div className="about-cohort-right">
            <p className="about-cohort-desc">
              In collaboration with <strong>ArtArtist</strong>, Cohort is becoming home to Hyderabad’s growing creator ecosystem — supporting artists, creators, designers, musicians, filmmakers, and innovators through a shared co-creative environment.
            </p>
            <p className="about-cohort-desc" style={{ marginTop: '-15px' }}>
              Together, we are transforming traditional coworking into something more human, artistic, and collaborative.
            </p>

            <div className="about-cohort-brand-box">
              <h4>Cohort × ArtArtist</h4>
              <p>
                Creating India’s next-generation co-creative ecosystem. Where infrastructure meets imagination. Where community meets creativity. Where artists finally belong.
              </p>
              <div className="about-cohort-brand-footer">
                From Coworking <span>To Co-Creating</span>
              </div>
              <p className="about-cohort-desc" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginTop: '12px', marginBottom: '0', lineHeight: '1.5' }}>
                Cohort is evolving beyond traditional workspace culture by supporting artist communities, creative collaboration, and cultural innovation through ArtDistrict.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — WHY ARTISTS NEED THIS ═══ */}
      <section id="why">
        <div className="reveal" ref={addToRevealRefs}>
          <h2 className="section-label">WHY ARTISTS NEED THIS</h2>
          <p className="section-sub">Because making art alone is only half the story.</p>
        </div>
        <div className="why-grid stagger" ref={addToRevealRefs}>
          <div className="why-card">
            <div className="why-icon"><Users size={20} /></div>
            <h3>No More Working Alone</h3>
            <p>Be part of a community that understands you.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><LinkIcon size={20} /></div>
            <h3>Creative Networking</h3>
            <p>Meet, connect and grow with like-minded artists.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Eye size={20} /></div>
            <h3>Portfolio Visibility</h3>
            <p>Showcase your art and get discovered by brands.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Palette size={20} /></div>
            <h3>Artist Collaborations</h3>
            <p>Find collaborators for projects & exhibitions.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Camera size={20} /></div>
            <h3>Content Creation Corners</h3>
            <p>Shoot, record and create with professional setups.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><Mic size={20} /></div>
            <h3>Artist Talks & Community</h3>
            <p>Positive people, creative vibes, endless energy.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><ImageIcon size={20} /></div>
            <h3>Gallery & Flea Popups</h3>
            <p>Exhibit, sell & present your art to the world.</p>
          </div>
          <div className="why-card">
            <div className="why-icon"><GraduationCap size={20} /></div>
            <h3>Workshops & Live Sessions</h3>
            <p>Learn, share & grow through expert experiences.</p>
          </div>
        </div>
      </section>

      {/* ═══ DESIGNED FOR CREATORS ═══ */}
      <section className="built-for-creators-section reveal" ref={addToRevealRefs}>
        <div className="creators-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-label" style={{ justifyContent: 'center' }}>BUILT FOR CREATORS</h2>
          <p className="section-sub">ArtDistrict at Cohort is designed to empower every creative discipline.</p>
        </div>

        <div className="creators-grid stagger" ref={addToRevealRefs}>
          <div className="creator-card">
            <span className="creator-card-icon"><Palette size={24} /></span>
            <h3>Painters</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Feather size={24} /></span>
            <h3>Illustrators</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Layers size={24} /></span>
            <h3>Sculptors</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Mic size={24} /></span>
            <h3>Musicians</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><PenTool size={24} /></span>
            <h3>Designers</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Camera size={24} /></span>
            <h3>Filmmakers</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Feather size={24} /></span>
            <h3>Writers</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Camera size={24} /></span>
            <h3>Photographers</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Layers size={24} /></span>
            <h3>Digital Creators</h3>
          </div>
          <div className="creator-card">
            <span className="creator-card-icon"><Globe size={24} /></span>
            <h3>Creative Startups</h3>
          </div>
        </div>

        <div className="built-for-creators-footer">
          A place where creativity feels alive every day.
        </div>
      </section>

      {/* ═══ SECTION 4 — PASSES ═══ */}
      <section id="passes">
        <div className="passes-header reveal" ref={addToRevealRefs}>
          <h2 className="section-label">ARTDISTRICT PASSES</h2>
          <p className="section-sub">Choose a pass that matches your creative pace and gives you entry.</p>
        </div>
        <div className="passes-grid stagger" ref={addToRevealRefs}>
          {passes.map((pass, i) => {
            let IconComp = Feather;
            if (pass.iconType === 'layers') IconComp = Layers;
            else if (pass.iconType === 'crown') IconComp = Crown;
            else if (pass.iconType === 'palette') IconComp = Palette;

            const cardClass = pass.themeColor === 'red' ? 'monthly-card' : pass.themeColor === 'white' ? 'weekly-card' : 'daily-card';
            const textColor = pass.themeColor === 'black' ? 'var(--red)' : 'var(--white)';

            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                className={`pass-card ${cardClass} cursor-pointer`}
                onClick={() => openModal(pass)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(pass);
                  }
                }}
              >
                <span className="pass-card-palette-icon"><IconComp size={28} /></span>
                <span className="pass-name">{pass.title}</span>
                <div className="pass-price">₹{pass.price}</div>
                <div className="pass-period">{pass.period}</div>
                <div className="pass-divider"></div>
                <ul className="pass-features">
                  {pass.features.flatMap(feat => feat.split('\n')).filter(f => f.trim()).map((featLine, j) => (
                    <li key={j}>{featLine}</li>
                  ))}
                </ul>
                <div className="text-center font-bold tracking-widest text-xs uppercase mt-4" style={{ fontFamily: 'var(--font-head)', color: textColor }}>
                  {pass.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SECTION 5 — COMMUNITY GALLERY ═══ */}
      <section id="gallery">
        <div className="gallery-header reveal" ref={addToRevealRefs}>
          <div>
            <h2 className="section-label">COMMUNITY GALLERY</h2>
            <p className="section-sub">A glimpse of the masterpieces created within our district.</p>
          </div>
        </div>
        <div className="gallery-masonry stagger" ref={addToRevealRefs}>
          {(apiGallery.length > 0 ? apiGallery : [
            { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', alt: 'Abstract Painting' },
            { url: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=600&q=80', alt: 'Sculpture art' },
            { url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80', alt: 'Colorful canvas' },
            { url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&q=80', alt: 'Dynamic sculpture' },
            { url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&q=80', alt: 'Digital art canvas' },
            { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80', alt: 'Modern fluid art' }
          ]).map((img, i) => (
            <div key={i} className="gallery-item">
              <img src={img.url} alt={img.alt || img.caption || `Gallery ${i + 1}`} loading="lazy" />
              <div className="red-accent"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TYPOGRAPHY STATEMENT BANNER ═══ */}
      <section className="statement-banner-section reveal" ref={addToRevealRefs}>
        <div className="statement-banner-content">
          <blockquote className="statement-banner-quote">
            “India built coworking spaces for startups.
            <span className="accent block-text">ArtDistrict is building <span style={{ whiteSpace: 'nowrap' }}>co-creative</span> spaces for artists.”</span>
          </blockquote>
        </div>
      </section>

      {/* ═══ SECTION 6 — TESTIMONIALS ═══ */}
      {testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="bg-[#F2F2F2] py-24 px-6 md:px-12 lg:px-24">
          <div className="reveal max-w-6xl mx-auto mb-16" ref={addToRevealRefs}>
            <h2 className="section-label">WHAT CREATORS SAY</h2>
            <p className="section-sub">Real stories from the residents of Hyderabad's creative district.</p>
          </div>
          
          <div className="reveal max-w-6xl mx-auto" ref={addToRevealRefs}>
            <div className="testimonial-track-wrap">
              <div className="testimonial-track" ref={trackRef}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="testimonial-card relative">
                    {/* Removed social icon */}
                    <div className="testimonial-quote">“</div>
                    <div className="testimonial-text">
                      {testimonial.text}
                    </div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        <img src={testimonial.image || 'https://via.placeholder.com/50'} alt={testimonial.name} />
                      </div>
                      <div>
                        <span className="testimonial-name">{testimonial.name}</span>
                        <span className="testimonial-role">{testimonial.jobtitle}</span>
                      </div>
                    </div>
                    
                    {/* Removed audio player bar */}
                  </div>
                ))}
              </div>
            </div>
            <div className="testimonial-nav">
              <button className="t-nav-btn" onClick={() => scrollTrack('left')}>←</button>
              <button className="t-nav-btn" onClick={() => scrollTrack('right')}>→</button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 7 — FINAL CTA ═══ */}
      <section id="cta-final">
        <div className="cta-brush-bg">
          <svg className="cta-brush-anim cta-brush-1" viewBox="0 0 400 200" fill="none" style={{ left: '-60px', top: '-40px', width: '400px' }} xmlns="http://www.w3.org/2000/svg">
            <path d="M380 20 C320 10, 160 50, 10 160 C40 140, 240 70, 380 20Z" fill="#D71920" opacity=".12"/>
          </svg>
          <svg className="cta-brush-anim cta-brush-2" viewBox="0 0 350 180" fill="none" style={{ right: '-60px', bottom: '-40px', width: '350px', transform: 'rotate(180deg)' }} xmlns="http://www.w3.org/2000/svg">
            <path d="M330 20 C270 10, 130 50, 10 140 C40 120, 200 60, 330 20Z" fill="#D71920" opacity=".08"/>
          </svg>
        </div>
        <span className="cta-pre">LIMITED RESIDENCIES AVAILABLE</span>
        <h2 className="cta-h2">
          READY TO ENTER THE
          <span className="red">DISTRICT?</span>
        </h2>
        <p className="cta-sub">Claim your co-creative pass today and become part of Hyderabad's premier artistic hub.</p>
      </section>

      {/* ═══ SUB-FOOTER BRAND RIBBON ═══ */}
      <div className="sub-footer-ribbon">
        <div className="sub-footer-left">
          ArtDistrict by ArtArtist <span>× Cohort</span>
        </div>
        <div className="sub-footer-right">
          Create • Connect • Collaborate • Evolve
        </div>
      </div>

      <Footer />

      {/* ═══════════════════════════════════════════════
         MODAL — CONFIGURATOR
      ════════════════════════════════════════════════ */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-district">
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Join <span>ArtDistrict</span></h3>
              <div className="modal-subtitle">Configure your co-creative pass</div>
            </div>
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>

          <div className="modal-body">
            <form onSubmit={handlePassSubmit}>
              {/* Selected pass display */}
              <div className="selected-pass-card">
                <div>
                  <span className="ps-name">{selectedPass?.title || 'Pass'}</span>
                  <span className="ps-price">₹{selectedPass?.price}</span>
                </div>
                <button type="button" className="sp-change" onClick={togglePassSelector}>
                  {showPassSelector ? 'Close' : 'Change'}
                </button>
              </div>

              {/* Pass options dropdown */}
              {showPassSelector && (
                <div className="pass-selector">
                  <div className="pass-selector-title">Select a different pass</div>
                  <div className="pass-options">
                    {passes.map((pass, i) => (
                      <div 
                        key={i}
                        className={`pass-option ${selectedPass?.title === pass.title ? 'selected' : ''}`}
                        onClick={() => selectPassOption(pass)}
                      >
                        <div className="pass-option-info">
                          <div className="pass-option-name">{pass.title}</div>
                          <div className="pass-option-price">
                            ₹{pass.price} {pass.period}
                          </div>
                        </div>
                        <div className="pass-option-check">
                          {selectedPass?.title === pass.title ? '✓' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="Ananya Reddy" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.fullName && <div className="form-error" style={{ display: 'block' }}>{formErrors.fullName}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="emailAddress">Email Address</label>
                  <input 
                    type="email" 
                    id="emailAddress" 
                    placeholder="ananya@example.com" 
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.emailAddress && <div className="form-error" style={{ display: 'block' }}>{formErrors.emailAddress}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="instaHandle">Instagram Handle</label>
                  <input 
                    type="text" 
                    id="instaHandle" 
                    placeholder="@ananya.art" 
                    value={formData.instaHandle}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.instaHandle && <div className="form-error" style={{ display: 'block' }}>{formErrors.instaHandle}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="artCategory">Creative Category</label>
                  <select 
                    id="artCategory" 
                    value={formData.artCategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Painter">Painter / Fine Artist</option>
                    <option value="Sculptor">Sculptor</option>
                    <option value="Digital Artist">Digital Artist / Designer</option>
                    <option value="Writer">Writer / Poet</option>
                    <option value="Musician">Musician / Producer</option>
                    <option value="Photographer">Photographer / Filmmaker</option>
                    <option value="Other">Other Creative Idea</option>
                  </select>
                  {formErrors.artCategory && <div className="form-error" style={{ display: 'block' }}>{formErrors.artCategory}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select 
                  id="paymentMethod" 
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>

              {(() => {
                const hasPaymentLink = !!selectedPass?.paymentLink;

                return (
                  <>
                    {hasPaymentLink && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>💳</span>
                        <span>After submitting, you'll be redirected to complete payment securely.</span>
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className={`modal-proceed-btn ${isSubmitting ? 'btn-loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '' : (hasPaymentLink ? 'Submit & Proceed to Payment' : 'Create Pass')}
                    </button>
                  </>
                );
              })()}
            </form>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
         DIGITAL PASS / SUCCESS SCREEN
      ════════════════════════════════════════════════ */}
      <div className={`pass-success-overlay ${isSuccessOpen ? 'open' : ''}`}>
        {generatedPass && (
          <div className="pass-success-wrap">
            <div className="welcome-header">
              <span className="welcome-icon"><Sparkles size={40} /></span>
              <h2 className="welcome-title">WELCOME TO THE DISTRICT!</h2>
              <p className="welcome-sub">Your co-creative entry pass has been generated successfully.</p>
            </div>
            
            <div className="digital-pass">
              <div className="dp-top">
                <div className="dp-logo-colab">
                  <img src="/art-district-logo.png" alt="ArtDistrict x Cohort Logo" className="dp-logo-img" />
                  <div className="dp-logo-text">
                    <span className="dp-logo-sub">Co-Creative Pass</span>
                  </div>
                </div>
                <span className="dp-pass-type">{generatedPass.passType}</span>
              </div>

              <div className="dp-body">
                <div className="dp-member">
                  <div className="dp-avatar">{generatedPass.initials}</div>
                  <div>
                    <h3 className="dp-name">{generatedPass.fullName}</h3>
                    <div className="dp-category">{generatedPass.category}</div>
                    <div className="dp-insta">{generatedPass.insta}</div>
                  </div>
                </div>

                <div className="dp-meta">
                  <div className="dp-meta-item">
                    <span className="dp-meta-label">STATUS</span>
                    <span className="dp-meta-value red">ACTIVE</span>
                  </div>
                  <div className="dp-meta-item">
                    <span className="dp-meta-label">VALID FROM</span>
                    <span className="dp-meta-value">{generatedPass.validFrom}</span>
                  </div>
                  <div className="dp-meta-item">
                    <span className="dp-meta-label">VALID THRU</span>
                    <span className="dp-meta-value">{generatedPass.validThru}</span>
                  </div>
                </div>

                <div className="dp-footer">
                  <span className="dp-location"><MapPin size={14} /> Hyderabad</span>
                  <span className="dp-id">MEMBER ID: <strong>{generatedPass.memberId}</strong></span>
                </div>
              </div>

              <div className="dp-qr-section">
                <div className="dp-qr-box">
                  <img src={generatedPass.qrCodeUrl} alt="Entry QR Code" loading="lazy" />
                </div>
                <div className="dp-scan-text">
                  <strong>SCAN TO ENTER DISTRICT</strong>
                  Scan this code at the reception desk to log your workspace entry.
                </div>
              </div>

              <div className="dp-barcode-strip"></div>
            </div>

            <div className="pass-actions">
              <button className="pass-action-btn pab-dl" onClick={downloadPassPdf}>Print Pass</button>
              <button className="pass-action-btn pab-close" onClick={closeSuccessOverlay}>Done</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArtDistrict;
