import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { artistsAPI, productsAPI, ecommerceAPI } from '../services/api';
import SEO from './SEO';
import Loader from './Loader';
import { useAuth } from '../contexts/AuthContext';
import './ArtistProfile.css';

const ArrowIcon = () => (
  <svg className="ap-arr" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20.5C5 15.5 3 12 3 8.8A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 9 2.3c0 3.2-2 6.7-9 11.7Z" />
  </svg>
);

const getArtworkImage = (artwork) => {
  if (artwork?.images?.length > 0) {
    return artwork.images[0].url || artwork.images[0];
  }
  return artwork?.image?.url || artwork?.image || 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg';
};

const getLikeCount = (artwork) =>
  Array.isArray(artwork?.likes) ? artwork.likes.length : (artwork?.likes || 0);

const splitName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: 'Artist', rest: '' };
  if (parts.length === 1) return { first: parts[0], rest: '' };
  return { first: parts[0], rest: parts.slice(1).join(' ') };
};

const getInitials = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AA';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
};

const socialUrl = (value, base) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${base}${value.replace(/^@/, '')}`;
};

const ArtistProfile = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [likedArtworks, setLikedArtworks] = useState(new Set());
  const [previewImage, setPreviewImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('works');
  const [brief, setBrief] = useState({ idea: '', budget: 'Under ₹5,000', by: '' });
  const [briefSent, setBriefSent] = useState(false);
  const [buyModal, setBuyModal] = useState({ open: false, artwork: null });
  const [buyForm, setBuyForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const fetchArtistAndArtworks = async () => {
      try {
        setLoading(true);
        const res = await artistsAPI.getArtist(artistId);
        let artistData = null;

        if (res.data) artistData = res.data;
        else if (res.artist) artistData = res.artist;
        else if (res) artistData = res;

        if (artistData) {
          try {
            const productsRes = await productsAPI.getProducts({ artistProfile: artistData._id });
            const artworks = productsRes.products || productsRes || [];

            try {
              const likedProductsRes = await productsAPI.getLikedProducts();
              const likedProductIds = new Set(
                likedProductsRes.products?.map((p) => p._id || p.id) || []
              );
              setLikedArtworks(likedProductIds);
              artistData.artworks = artworks.map((artwork) => ({
                ...artwork,
                isLiked: likedProductIds.has(artwork._id || artwork.id)
              }));
            } catch {
              artistData.artworks = artworks;
            }

            setArtist(artistData);
          } catch {
            artistData.artworks = [];
            setArtist(artistData);
          }
        }
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAndArtworks();
  }, [artistId]);

  useEffect(() => {
    const ids = ['works', 'about', 'hire'];
    const observers = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((io) => io.disconnect());
  }, [artist]);

  const handleShare = async () => {
    const url = window.location.href;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    };

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${artist?.name} - Artist Profile`,
          text: `Check out ${artist?.name}'s artwork on ArtArtist`,
          url
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      done();
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        done();
      } catch {
        done();
      }
    }
  };

  const handleLike = async (artworkId) => {
    try {
      const response = await productsAPI.likeProduct(artworkId);

      if (artist?.artworks) {
        const updatedArtworks = artist.artworks.map((artwork) => {
          if ((artwork._id || artwork.id) === artworkId) {
            const newLikeCount =
              response.likes !== undefined
                ? response.likes
                : getLikeCount(artwork) + 1;
            return {
              ...artwork,
              likes: newLikeCount,
              isLiked: response.isLiked !== undefined ? response.isLiked : true
            };
          }
          return artwork;
        });
        setArtist({ ...artist, artworks: updatedArtworks });
      }

      const next = new Set(likedArtworks);
      if (likedArtworks.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      setLikedArtworks(next);
    } catch (error) {
      console.error('Error liking artwork:', error);
      const next = new Set(likedArtworks);
      if (likedArtworks.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      setLikedArtworks(next);

      if (artist?.artworks) {
        const updatedArtworks = artist.artworks.map((artwork) => {
          if ((artwork._id || artwork.id) === artworkId) {
            const currentLikes = getLikeCount(artwork);
            return {
              ...artwork,
              likes: next.has(artworkId) ? currentLikes + 1 : currentLikes - 1,
              isLiked: next.has(artworkId)
            };
          }
          return artwork;
        });
        setArtist({ ...artist, artworks: updatedArtworks });
      }
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      alert('Please log in to message the artist');
      navigate('/login');
      return;
    }
    navigate('/dashboard', {
      state: {
        startChatWith: {
          _id: artist._id,
          name: artist.name || artist.displayName,
          image: artist.image?.url || artist.photoURL,
          email: artist.email
        }
      }
    });
  };

  const handleBriefSubmit = (e) => {
    e.preventDefault();
    setBriefSent(true);
    handleContact();
  };

  const handleBuyArtwork = (e, artwork) => {
    e.stopPropagation();
    if (
      (!artwork.price || artwork.price <= 0) &&
      (artwork.paymentLink || artist?.ecommercePayment?.paymentLink)
    ) {
      window.open(
        artwork.paymentLink || artist?.ecommercePayment?.paymentLink,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    setBuyError('');
    setBuyForm({ name: '', email: '', phone: '', address: '' });
    setBuyModal({ open: true, artwork });
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!buyModal.artwork) return;
    if (!buyForm.name.trim() || !buyForm.email.trim() || !buyForm.phone.trim()) {
      setBuyError('Full Name, Email, and Phone number are required.');
      return;
    }
    setBuyLoading(true);
    setBuyError('');

    try {
      const res = await ecommerceAPI.createPurchaseSession({
        productId: buyModal.artwork._id || buyModal.artwork.id,
        artistId: artist._id || artist.id,
        buyerName: buyForm.name.trim(),
        buyerEmail: buyForm.email.trim(),
        buyerPhone: buyForm.phone.trim(),
        shippingAddress: { street: buyForm.address.trim(), country: 'India' }
      });

      if (res?.paymentSessionId) {
        if (typeof window.Cashfree === 'undefined') {
          setBuyError('Cashfree gateway is loading, please try again in a moment.');
          setBuyLoading(false);
          return;
        }

        const cashfree = window.Cashfree({
          mode: res.environment === 'PRODUCTION' ? 'production' : 'sandbox'
        });

        cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          returnUrl: `${window.location.origin}/ecommerce-success?order_id=${res.orderId}&product=${encodeURIComponent(buyModal.artwork.name || '')}&artist=${encodeURIComponent(artist.name || '')}`
        });

        setBuyModal({ open: false, artwork: null });
      } else {
        setBuyError(res?.error || 'Failed to initialize payment.');
      }
    } catch (err) {
      console.error('Buy artwork error:', err);
      setBuyError(err?.response?.data?.error || err.message || 'Payment failed. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  const { firstName, restName, initials, locationLabel, cityLabel, availableCount, bioText } =
    useMemo(() => {
      if (!artist) {
        return {
          firstName: '',
          restName: '',
          initials: 'AA',
          locationLabel: '',
          cityLabel: '',
          availableCount: 0,
          bioText: ''
        };
      }
      const { first, rest } = splitName(artist.name || 'Artist');
      const locationParts = [
        artist.location?.city,
        artist.location?.state,
        artist.location?.country
      ].filter(Boolean);
      const artworks = artist.artworks || [];
      return {
        firstName: first,
        restName: rest,
        initials: getInitials(artist.name),
        locationLabel: locationParts.join(', ') || artist.city || 'India',
        cityLabel: artist.location?.city || artist.city || 'India',
        availableCount: artworks.filter((a) => a.status === 'available').length || artworks.length,
        bioText:
          artist.bio ||
          artist.description ||
          artist.about ||
          `${artist.name} is an artist on ArtArtist creating work in ${artist.artForm || 'their craft'}.`
      };
    }, [artist]);

  if (loading) {
    return (
      <>
        <SEO title="Loading Artist Profile" />
        <Navbar />
        <div className="ap-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
          <div style={{ flexGrow: 1, display: 'grid', placeItems: 'center' }}>
            <Loader size={120} />
          </div>
        </div>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <SEO title="Artist Not Found" />
        <Navbar />
        <div className="ap-page">
          <div className="ap-w" style={{ paddingBlock: '80px', textAlign: 'center' }}>
            <span className="ap-kicker">Profile</span>
            <h2 style={{ margin: '18px 0 12px' }}>Artist not found</h2>
            <p className="ap-lead" style={{ margin: '0 auto 28px' }}>
              We couldn&apos;t find this artist. They may not have a profile yet, or the link might be incorrect.
            </p>
            <button type="button" className="ap-btn" onClick={() => navigate('/artists')}>
              Browse all artists <ArrowIcon />
            </button>
          </div>
        </div>
      </>
    );
  }

  const instagram = socialUrl(artist.social?.instagram, 'https://instagram.com/');
  const facebook = socialUrl(artist.social?.facebook, 'https://facebook.com/');
  const twitter = socialUrl(artist.social?.twitter, 'https://x.com/');
  const website = socialUrl(artist.social?.website, 'https://');
  const hasPhoto = Boolean(artist.image?.url);

  return (
    <>
      <SEO
        title={`${artist.name} - Artist Profile`}
        description={`Discover ${artist.name}'s ${artist.artForm || ''} artworks. Connect with the artist and explore their portfolio on ArtArtist.`}
        canonical={`https://artartist.com/artist/${artist._id}`}
      />

      <Navbar />

      <div className="ap-page" data-theme="light">
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter id="ap-rough" x="-10%" y="-60%" width="120%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency=".035 .5" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="9" />
          </filter>
        </svg>

        <div className="ap-w" id="top">
          <div className="ap-crumbs">
            <button type="button" onClick={() => navigate('/artists')}>
              Artists
            </button>
            <span>/</span>
            <span>{cityLabel}</span>
            <span>/</span>
            <b>{artist.name}</b>
          </div>
        </div>

        <header className="ap-hero">
          <div className="ap-w">
            <div className="ap-portrait">
              <div className="ap-photo">
                {hasPhoto ? (
                  <img
                    src={artist.image.url}
                    alt={artist.image?.alt || artist.name}
                  />
                ) : (
                  <>
                    <span className="ap-initials">{initials}</span>
                    <small>Portrait photo</small>
                  </>
                )}
              </div>
              <svg className="ap-seal" viewBox="0 0 150 150" aria-label="Verified artist">
                <defs>
                  <path
                    id="ap-ring"
                    d="M75 75m-56 0a56 56 0 1 1 112 0a56 56 0 1 1-112 0"
                  />
                </defs>
                <circle className="ap-ring" cx="75" cy="75" r="74" />
                <text>
                  <textPath href="#ap-ring">
                    VERIFIED ARTIST · ARTARTIST · VERIFIED ARTIST ·{' '}
                  </textPath>
                </text>
                <circle className="ap-core" cx="75" cy="75" r="13" />
              </svg>
            </div>

            <div className="ap-info">
              <div className="ap-chips">
                <span className="ap-chip">
                  <span className="ap-dot" />
                  Open for commissions
                </span>
                {artist.isEcommerceSeller && (
                  <span className="ap-chip">Official e-commerce store</span>
                )}
                {artist.artistNumber && (
                  <span className="ap-chip id">#{artist.artistNumber}</span>
                )}
              </div>

              <h1>
                <span className="ap-l">{firstName}</span>
                {restName ? (
                  <span className="ap-l">
                    <i className="ap-name">{restName}</i>
                  </span>
                ) : null}
              </h1>

              <p className="ap-lead">{bioText}</p>

              <div className="ap-acts">
                <button type="button" className="ap-btn" onClick={handleContact}>
                  Hire {firstName} <ArrowIcon />
                </button>
                {instagram && (
                  <a className="ap-rnd" href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 18 18">
                      <rect x="2.5" y="2.5" width="13" height="13" rx="3.5" />
                      <circle cx="9" cy="9" r="3" />
                      <path d="M13 5h.01" />
                    </svg>
                  </a>
                )}
                {facebook && (
                  <a className="ap-rnd" href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg viewBox="0 0 18 18">
                      <path d="M11.5 3H10a2.5 2.5 0 0 0-2.5 2.5V16M5 9h6" />
                    </svg>
                  </a>
                )}
                {twitter && (
                  <a className="ap-rnd" href={twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                    <svg viewBox="0 0 18 18">
                      <path d="m3.5 3.5 11 11M14.5 3.5l-11 11" />
                    </svg>
                  </a>
                )}
                {website && (
                  <a className="ap-rnd" href={website} target="_blank" rel="noopener noreferrer" aria-label="Website">
                    <svg viewBox="0 0 18 18">
                      <circle cx="9" cy="9" r="6.5" />
                      <path d="M2.5 9h13M9 2.5c2 2.2 2 10.8 0 13M9 2.5c-2 2.2-2 10.8 0 13" />
                    </svg>
                  </a>
                )}
                <button className="ap-rnd" type="button" onClick={handleShare} aria-label="Share profile">
                  <svg viewBox="0 0 18 18">
                    <circle cx="4.5" cy="9" r="2" />
                    <circle cx="13.5" cy="4.5" r="2" />
                    <circle cx="13.5" cy="13.5" r="2" />
                    <path d="m6.3 8.1 5.4-2.7M6.3 9.9l5.4 2.7" />
                  </svg>
                </button>
              </div>

              <dl className="ap-facts">
                <div>
                  <dt>Art form</dt>
                  <dd>{artist.artForm || artist.specialty || 'Artist'}</dd>
                </div>
                <div>
                  <dt>Based in</dt>
                  <dd>{locationLabel}</dd>
                </div>
                <div>
                  <dt>Artworks</dt>
                  <dd>
                    {availableCount} {availableCount === 1 ? 'piece' : 'for sale'}
                  </dd>
                </div>
                <div>
                  <dt>Store</dt>
                  <dd>{artist.isEcommerceSeller ? 'Open' : 'Profile only'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <div className="ap-subnav">
          <div className="ap-w">
            <a
              className={`ap-u${activeSection === 'works' ? ' is-active' : ''}`}
              href="#works"
              aria-current={activeSection === 'works' ? 'page' : undefined}
            >
              Artworks
              <sup>{(artist.artworks || []).length}</sup>
            </a>
            <a
              className={`ap-u${activeSection === 'about' ? ' is-active' : ''}`}
              href="#about"
              aria-current={activeSection === 'about' ? 'page' : undefined}
            >
              About
            </a>
            <a
              className={`ap-u${activeSection === 'hire' ? ' is-active' : ''}`}
              href="#hire"
              aria-current={activeSection === 'hire' ? 'page' : undefined}
            >
              Commission
            </a>
            <span className="ap-sp" />
            {copied && <span className="ap-copied">Link copied</span>}
          </div>
        </div>

        <section className="ap-section" id="works">
          <div className="ap-w">
            <div className="ap-sec-head">
              <div>
                <span className="ap-kicker">
                  {availableCount > 0 ? 'Available now' : 'Portfolio'}
                </span>
                <h2>
                  Work by <i>{firstName}</i>
                </h2>
              </div>
            </div>

            {artist.artworks?.length > 0 ? (
              <div className="ap-works">
                {artist.artworks.map((artwork) => {
                  const id = artwork._id || artwork.id;
                  const liked = artwork.isLiked || likedArtworks.has(id);
                  const image = getArtworkImage(artwork);
                  const canBuy =
                    artist.isEcommerceSeller &&
                    artwork.status === 'available' &&
                    (artwork.price > 0 ||
                      artwork.paymentLink ||
                      artist?.ecommercePayment?.paymentLink);

                  return (
                    <figure className="ap-art" key={id}>
                      <div
                        className="ap-art-img"
                        onClick={() => setPreviewImage(image)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setPreviewImage(image);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <img src={image} alt={artwork.name || artwork.title || 'Artwork'} />
                        {artwork.status === 'available' && (
                          <span className="ap-tag">
                            <span className="ap-dot" />
                            Available
                          </span>
                        )}
                        <button
                          className="ap-like"
                          type="button"
                          aria-pressed={liked}
                          aria-label={`Like ${artwork.name || artwork.title || 'artwork'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(id);
                          }}
                        >
                          <HeartIcon />
                          <span>{getLikeCount(artwork)}</span>
                        </button>
                      </div>
                      <figcaption>
                        <div>
                          <b>{artwork.name || artwork.title || 'Untitled'}</b>
                          <span>
                            {[artwork.category, artist.artForm].filter(Boolean).join(' · ') ||
                              'Artwork'}
                          </span>
                        </div>
                        {artwork.price > 0 && (
                          <em>₹{Number(artwork.price).toLocaleString('en-IN')}</em>
                        )}
                      </figcaption>
                      {canBuy ? (
                        <button
                          className="ap-btn ghost"
                          type="button"
                          onClick={(e) => handleBuyArtwork(e, artwork)}
                        >
                          <span>Buy artwork</span> <ArrowIcon />
                        </button>
                      ) : null}
                    </figure>
                  );
                })}
              </div>
            ) : (
              <div className="ap-empty">
                <h3>No artworks yet</h3>
                <p>{artist.name} hasn&apos;t added any artworks to their profile yet.</p>
                <button type="button" className="ap-btn" onClick={() => navigate('/artists')}>
                  Browse other artists <ArrowIcon />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="ap-section ap-about" id="about">
          <div className="ap-w">
            <div className="ap-about-h">
              <span className="ap-kicker">About the artist</span>
              <h2>
                The person<br />
                <i>behind the work</i>
              </h2>
            </div>
            <div className="ap-bio">
              <p className="ap-big">
                {artist.name}
                {artist.artForm ? (
                  <>
                    {' '}
                    works as a <i>{artist.artForm}</i>
                    {cityLabel ? ` based in ${cityLabel}` : ''}.
                  </>
                ) : (
                  <> is an artist on ArtArtist.</>
                )}
              </p>
              <p>{bioText}</p>
              {artist.isTeamMember && artist.teamRole && (
                <p>
                  Part of the ArtArtist core team as <strong>{artist.teamRole}</strong>.
                </p>
              )}
              <ul className="ap-roles">
                {artist.artForm && (
                  <li>
                    {artist.artForm} <span>craft</span>
                  </li>
                )}
                <li>
                  {locationLabel || 'India'} <span>base</span>
                </li>
                {artist.isEcommerceSeller && (
                  <li>
                    E-commerce store <span>shop</span>
                  </li>
                )}
                {artist.isTeamMember && (
                  <li>
                    {artist.teamRole || 'Team member'} <span>team</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="ap-section" id="hire">
          <div className="ap-w">
            <div className="ap-band">
              <div className="ap-band-l">
                <span className="ap-kicker">Commission a piece</span>
                <h2>
                  Have something <i>in mind?</i>
                </h2>
                <p>
                  Tell {firstName} what you would like made. You message them directly through
                  ArtArtist.
                </p>
              </div>
              <form className="ap-brief" onSubmit={handleBriefSubmit}>
                <div className="ap-field">
                  <label htmlFor="ap-idea">What should they create?</label>
                  <input
                    id="ap-idea"
                    type="text"
                    placeholder="A portrait, mural, custom piece…"
                    required
                    value={brief.idea}
                    onChange={(e) => setBrief({ ...brief, idea: e.target.value })}
                  />
                </div>
                <div className="ap-two">
                  <div className="ap-field">
                    <label htmlFor="ap-budget">Budget</label>
                    <select
                      id="ap-budget"
                      value={brief.budget}
                      onChange={(e) => setBrief({ ...brief, budget: e.target.value })}
                    >
                      <option>Under ₹5,000</option>
                      <option>₹5,000 to ₹15,000</option>
                      <option>Above ₹15,000</option>
                    </select>
                  </div>
                  <div className="ap-field">
                    <label htmlFor="ap-by">Needed by</label>
                    <input
                      id="ap-by"
                      type="date"
                      value={brief.by}
                      onChange={(e) => setBrief({ ...brief, by: e.target.value })}
                    />
                  </div>
                </div>
                <button className="ap-btn" type="submit">
                  Send brief <ArrowIcon />
                </button>
                {briefSent && (
                  <p className="ap-sent">Opening a chat so you can send this brief…</p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>

      {previewImage && (
        <div className="ap-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <img className="ap-preview-img" src={previewImage} alt="Artwork preview" />
            <button
              type="button"
              className="ap-preview-close"
              onClick={() => setPreviewImage(null)}
              aria-label="Close preview"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {buyModal.open && buyModal.artwork && (
        <div className="ap-modal-overlay">
          <div className="ap-modal">
            <div className="ap-modal-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <span className="ap-kicker">Official purchase</span>
                  <h3>{buyModal.artwork.name}</h3>
                  <p style={{ color: 'var(--ap-muted)', fontSize: '0.9rem', marginTop: 6 }}>
                    By {artist.name}
                  </p>
                </div>
                {buyModal.artwork.price > 0 && (
                  <div className="ap-modal-price">
                    ₹{Number(buyModal.artwork.price).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleBuySubmit}>
              <div className="ap-field">
                <label htmlFor="buy-name">Full Name *</label>
                <input
                  id="buy-name"
                  type="text"
                  required
                  value={buyForm.name}
                  onChange={(e) => setBuyForm({ ...buyForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="ap-two">
                <div className="ap-field">
                  <label htmlFor="buy-email">Email *</label>
                  <input
                    id="buy-email"
                    type="email"
                    required
                    value={buyForm.email}
                    onChange={(e) => setBuyForm({ ...buyForm, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="ap-field">
                  <label htmlFor="buy-phone">Mobile *</label>
                  <input
                    id="buy-phone"
                    type="tel"
                    required
                    value={buyForm.phone}
                    onChange={(e) => setBuyForm({ ...buyForm, phone: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="ap-field">
                <label htmlFor="buy-address">Delivery Address *</label>
                <textarea
                  id="buy-address"
                  required
                  rows={2}
                  value={buyForm.address}
                  onChange={(e) => setBuyForm({ ...buyForm, address: e.target.value })}
                  placeholder="Street, City, State, PIN code"
                />
              </div>

              {buyError && <div className="ap-modal-error">{buyError}</div>}

              <div className="ap-modal-actions">
                <button
                  type="button"
                  className="ap-btn ghost"
                  onClick={() => setBuyModal({ open: false, artwork: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="ap-btn" disabled={buyLoading}>
                  {buyLoading
                    ? 'Opening Gateway...'
                    : `Pay ₹${Number(buyModal.artwork.price || 0).toLocaleString('en-IN')}`}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ap-muted)' }}>
                Secured via Cashfree Payment Gateway
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistProfile;
