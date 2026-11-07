import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from 'react';

import { Search, ArrowLeft, MapPin, X, User, ChevronRight, Instagram, Facebook, Globe, MessageSquare, Share2, Heart, Palette, Briefcase, ArrowUp, Check, Copy, MessageCircle, ShoppingBag, Store } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, ecommerceAPI } from '../services/api';
import SEO from './SEO';

const normalizeCategory = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const pillToCategory = {
  'Painting': ['painting'],
  'Digital Art': ['digitalart', 'digital'],
  'Sculpture': ['sculpture'],
  'Photography': ['photography', 'photo'],
  'Print': ['print', 'prints'],
  'Supplies': ['supplies', 'supply'],
  'Other': ['other'],
};

const pillToBackendCategory = {
  'Painting': { 'category[$in][]': ['painting', 'Painting'] },
  'Digital Art': { 'category[$in][]': ['digital-art', 'Digital Art', 'digitalart', 'digitalArt'] },
  'Sculpture': { 'category[$in][]': ['sculpture', 'Sculpture'] },
  'Photography': { 'category[$in][]': ['photography', 'Photography'] },
  'Print': { 'category[$in][]': ['print', 'Print'] },
  'Supplies': { 'category[$in][]': ['supplies', 'Supplies'] },
  'Other': { 'category[$in][]': ['other', 'Other'] },
};

const getDeterministicHeight = (id) => {
  if (!id) return 250;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 150) + 200; // Deterministic height between 200px and 350px
};

// ── Shimmer skeleton card ────────────────────────────────────────────────────
const SkeletonCard = ({ height }) => (
  <div className="break-inside-avoid min-w-0" aria-hidden="true">
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ height: `${height}px` }}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="p-3.5 sm:p-4 space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-gray-100 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.1s] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        <div className="h-3 w-1/2 rounded-full bg-gray-100 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.2s] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>
    </div>
  </div>
);

const SKELETON_HEIGHTS = [260, 320, 220, 290, 250, 310, 240, 280, 270, 300, 230, 260];

// ── LazyImage with instant shimmer fade ──────────────────────────────────────
const LazyImage = memo(({ src, alt, height, className, eager }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className="relative bg-gray-100 overflow-hidden w-full"
      style={{ height: `${height}px` }}
    >
      {/* Shimmer placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
          <div className="text-center">
            <Palette size={32} strokeWidth={1.5} className="mx-auto mb-1 text-gray-300" />
            <div className="text-xs font-medium text-gray-400">No image</div>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          fetchpriority={eager ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
});

// ── Stable multi-column distribution (prevents CSS column reflow on append) ─
const useStableColumns = (items, columnCount) => {
  return useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((item, i) => {
      cols[i % columnCount].push({ item, globalIndex: i });
    });
    return cols;
  }, [items, columnCount]);
};

const useResponsiveColumnCount = () => {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCount(4);
      else if (w >= 1024) setCount(3);
      else if (w >= 640) setCount(2);
      else setCount(1);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return count;
};

// ── Stable Masonry Grid (flexbox columns, no reflow on append) ───────────────
const StableMasonryGrid = memo(({ products, loading, columnCount, onOpenPreview, onShare, onBuyArtwork }) => {
  const columns = useStableColumns(products, columnCount);

  if (loading && products.length === 0) {
    // Skeleton grid during initial load
    const skeletonCols = Array.from({ length: columnCount }, (_, colIdx) =>
      SKELETON_HEIGHTS.filter((_, i) => i % columnCount === colIdx)
    );
    return (
      <div className="flex gap-3 sm:gap-4 w-full min-w-0">
        {skeletonCols.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-4">
            {col.map((h, i) => (
              <SkeletonCard key={`sk-${colIdx}-${i}`} height={h} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 w-full min-w-0">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-4">
          {col.map(({ item: product, globalIndex }) => {
            const imageUrl = product?.images?.[0]?.url;
            const stableHeight = getDeterministicHeight(product._id);
            const isEager = globalIndex < 8; // First 8 images load eagerly

            return (
              <div
                key={product._id}
                className="group cursor-pointer min-w-0"
              >
                <div
                  className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  onClick={() => onOpenPreview(product)}
                >
                  {/* Image */}
                  <div className="relative">
                    {imageUrl ? (
                      <LazyImage
                        src={imageUrl}
                        alt={product.name}
                        height={stableHeight}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        eager={isEager}
                      />
                    ) : (
                      <div className="w-full flex items-center justify-center text-gray-300 bg-gray-50" style={{ height: `${stableHeight}px` }}>
                        <div className="text-center">
                          <Palette size={36} strokeWidth={1.5} />
                          <div className="text-xs font-medium mt-1">No image</div>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:scale-110 transition-transform">
                            <Heart size={14} fill="currentColor" />
                          </div>
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:scale-110 transition-transform">
                            <MessageSquare size={14} />
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(product);
                          }}
                          className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                          title="Share Individual Artwork"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 max-w-[55%]">
                      <span className="inline-block max-w-full truncate px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-bold uppercase rounded-full shadow-sm tracking-wide">
                        {String(product.category || '').toUpperCase()}
                      </span>
                    </div>

                    {/* Status badge */}
                    {product.status === 'sold' ? (
                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                        <span className="px-2 py-0.5 bg-gray-900/90 text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                          SOLD
                        </span>
                      </div>
                    ) : product.status === 'available' && product.price > 0 ? (
                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                        <span className="px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                          FOR SALE
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 sm:p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-[15px] sm:text-sm min-w-0 flex-1">
                        {product.name}
                      </h3>
                      {product.price > 0 && (
                        <span className="text-[15px] sm:text-sm font-extrabold text-emerald-700 whitespace-nowrap flex-shrink-0">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {product?.artistProfile?.image?.url || product?.artist?.photoURL ? (
                          <img
                            src={product?.artistProfile?.image?.url || product?.artist?.photoURL}
                            alt="Artist"
                            loading="lazy"
                            decoding="async"
                            className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 flex-shrink-0">
                            <User size={12} />
                          </div>
                        )}
                        <span className="text-xs text-gray-500 truncate">
                          {product?.artistProfile?.name || product?.artist?.displayName || 'Unknown Artist'}
                        </span>
                      </div>

                      {product.status === 'available' && product.price > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBuyArtwork) onBuyArtwork(product);
                          }}
                          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex-shrink-0"
                          title="Buy this artwork"
                        >
                          <ShoppingBag size={13} />
                          <span>Buy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Inline skeleton rows while loading MORE (not initial) */}
          {loading && products.length > 0 &&
            SKELETON_HEIGHTS.slice(colIdx, colIdx + 1).map((h, i) => <SkeletonCard key={`more-sk-${colIdx}-${i}`} height={h} />)
          }
        </div>
      ))}
    </div>
  );
});

const ArtStore = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Live suggestions from loaded products & artist names
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 1) return [];
    const term = searchTerm.trim().toLowerCase();
    const matches = new Set();

    products.forEach(p => {
      if (p.name && p.name.toLowerCase().includes(term)) {
        matches.add(p.name);
      }
      const artistName = p.artistProfile?.name || p.artist?.displayName;
      if (artistName && artistName.toLowerCase().includes(term)) {
        matches.add(artistName);
      }
    });

    return Array.from(matches).slice(0, 6);
  }, [searchTerm, products]);
  const [selectedPill, setSelectedPill] = useState('All');
  const [previewItem, setPreviewItem] = useState(null);
  const [previewArtist, setPreviewArtist] = useState(null);

  // Cashfree E-Commerce Buy Modal State
  const [buyModal, setBuyModal] = useState({ open: false, product: null });
  const [buyForm, setBuyForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  // Dynamically load Cashfree SDK
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

  const handleBuyArtwork = (product) => {
    setBuyError('');
    setBuyForm({ name: '', email: '', phone: '', address: '' });
    setBuyModal({ open: true, product });
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!buyModal.product) return;
    if (!buyForm.name.trim() || !buyForm.email.trim() || !buyForm.phone.trim()) {
      setBuyError('Full Name, Email, and Phone number are required.');
      return;
    }
    setBuyLoading(true);
    setBuyError('');

    try {
      const resolvedArtistId = buyModal.product?.artistProfile?._id || buyModal.product?.artistProfile || buyModal.product?.artist?._id || buyModal.product?.artist;
      const res = await ecommerceAPI.createPurchaseSession({
        productId: buyModal.product._id || buyModal.product.id,
        artistId: resolvedArtistId,
        buyerName: buyForm.name.trim(),
        buyerEmail: buyForm.email.trim(),
        buyerPhone: buyForm.phone.trim(),
        shippingAddress: { street: buyForm.address.trim(), country: 'India' }
      });

      if (res && res.paymentSessionId) {
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
          returnUrl: `${window.location.origin}/ecommerce-success?order_id=${res.orderId}&product=${encodeURIComponent(buyModal.product.name || '')}`
        });

        setBuyModal({ open: false, product: null });
      } else {
        setBuyError(res?.error || 'Failed to initialize payment.');
      }
    } catch (err) {
      console.error('Buy artwork error:', err);
      setBuyError(err?.response?.data?.error || err.message || 'Payment initiation failed.');
    } finally {
      setBuyLoading(false);
    }
  };

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorLoadingMore, setErrorLoadingMore] = useState(false);
  const [initialError, setInitialError] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [shareModalProduct, setShareModalProduct] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerTarget = useRef(null);
  const deepLinkHandled = useRef(false);
  const columnCount = useResponsiveColumnCount();

  // Smooth scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open & Close Preview with URL query parameter sync for individual sharing
  const handleOpenPreview = (product) => {
    setPreviewItem(product);
    if (product?._id || product?.id) {
      setSearchParams({ id: product._id || product.id }, { replace: true });
    }
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
    setSearchParams({}, { replace: true });
  };

  // Deep linking: check URL search parameters for shared artwork link (?id=xxx or ?product=xxx)
  // Only runs once on mount + when searchParams change — NOT on every products update
  useEffect(() => {
    const sharedId = searchParams.get('id') || searchParams.get('product') || searchParams.get('item');
    if (!sharedId) {
      deepLinkHandled.current = false;
      return;
    }
    if (deepLinkHandled.current) return;

    // Check if product is already in state
    const existingProduct = products.find(p => (p._id || p.id) === sharedId);
    if (existingProduct) {
      setPreviewItem(existingProduct);
      deepLinkHandled.current = true;
    } else if (!loading) {
      // Only fetch from API once initial load is done and product wasn't found
      deepLinkHandled.current = true;
      productsAPI.getProduct(sharedId)
        .then(res => {
          const item = res.product || res.data || res;
          if (item) {
            setPreviewItem(item);
          }
        })
        .catch(err => console.error('Could not load shared artwork:', err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading]);

  // Handle pill click with smooth scroll to gallery container
  const handlePillClick = (category) => {
    setSelectedPill(category);
    const container = document.getElementById('art-grid-container');
    if (container && window.scrollY > 250) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Debounce search – 300ms feels instant, avoids excess API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset and fetch page 1 whenever search or pill changes
  // Stale-while-revalidate: keep old products visible while fetching
  useEffect(() => {
    let cancelled = false;

    const fetchInitial = async () => {
      try {
        setLoading(true);
        setErrorLoadingMore(false);
        setInitialError(false);
        setPage(1);
        setHasMore(true);

        const categoryParams = selectedPill !== 'All' ? pillToBackendCategory[selectedPill] : {};

        const res = await productsAPI.getProducts({
          page: 1,
          limit: 20,
          search: search || undefined,
          ...categoryParams
        });

        if (!cancelled) {
          const newProducts = res.products || [];
          setProducts(newProducts);
          setHasMore(newProducts.length >= 20);
        }
      } catch (e) {
        console.error('ArtStore initial fetch error:', e);
        if (!cancelled) {
          setProducts([]);
          setInitialError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInitial();
    return () => { cancelled = true; };
  }, [search, selectedPill]);

  const loadMoreProducts = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setErrorLoadingMore(false);
      const nextPage = page + 1;
      const categoryParams = selectedPill !== 'All' ? pillToBackendCategory[selectedPill] : {};

      const res = await productsAPI.getProducts({
        page: nextPage,
        limit: 20,
        search: search || undefined,
        ...categoryParams
      });

      const newProducts = res.products || [];
      
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNew = newProducts.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNew];
      });

      setPage(nextPage);
      setHasMore(newProducts.length >= 20);
    } catch (e) {
      console.error('ArtStore load more error:', e);
      setErrorLoadingMore(true);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, search, selectedPill]);

  useEffect(() => {
    if (loading || !hasMore || loadingMore || errorLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.01, rootMargin: '400px' } // trigger early — 400px before visible
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loading, loadingMore, hasMore, errorLoadingMore, loadMoreProducts]);

  const pills = ['All', 'Painting', 'Digital Art', 'Sculpture', 'Photography', 'Print', 'Supplies', 'Other'];

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedPill !== 'All') {
      const acceptedCategories = pillToCategory[selectedPill];
      if (acceptedCategories) {
        list = products.filter((p) => {
          const productCategory = normalizeCategory(p?.category);
          return acceptedCategories.includes(productCategory);
        });
      }
    }

    // Prioritize artworks with BUY option (available and priced) at the very top!
    return [...list].sort((a, b) => {
      const aCanBuy = a?.status === 'available' && Number(a?.price) > 0;
      const bCanBuy = b?.status === 'available' && Number(b?.price) > 0;

      if (aCanBuy && !bCanBuy) return -1;
      if (!aCanBuy && bCanBuy) return 1;

      // When both can buy (or both cannot buy), newest first
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
  }, [products, selectedPill]);

  const getArtistData = (product) => {
    if (product?.artistProfile) {
      return {
        name: product.artistProfile.name || 'Unknown Artist',
        imageUrl: product.artistProfile.image?.url || '',
        imageAlt: product.artistProfile.image?.alt || product.artistProfile.name || 'Artist',
        artForm: product.artistProfile.artForm || '',
        bio: product.artistProfile.bio || '',
        location: [product.artistProfile.location?.city, product.artistProfile.location?.state, product.artistProfile.location?.country]
          .filter(Boolean)
          .join(', '),
        social: product.artistProfile.social || {}
      };
    }

    return {
      name: product?.artist?.displayName || 'Unknown Artist',
      imageUrl: product?.artist?.photoURL || '',
      imageAlt: product?.artist?.displayName || 'Artist',
      artForm: '',
      bio: '',
      location: '',
      social: {}
    };
  };

  // Enhanced Individual Artwork Share Handler
  const handleShare = async (product, platform = null) => {
    if (!product) return;
    const productId = product._id || product.id;
    const shareUrl = `${window.location.origin}/art?id=${productId}`;
    const artistName = getArtistData(product).name;
    const shareTitle = `"${product.name}" by ${artistName}`;
    const shareText = `Check out this artwork "${product.name}" by ${artistName} on Art Showcase!`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      return;
    }
    if (platform === 'twitter') {
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      return;
    }
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      return;
    }
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Individual artwork link copied to clipboard!');
      } catch (e) {
        showToast('Artwork URL: ' + shareUrl);
      }
      return;
    }

    // Default: Native Share if available, otherwise open Share Modal
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShareModalProduct(product);
        }
      }
    } else {
      setShareModalProduct(product);
    }
  };

  return (
    <>
      <SEO 
        title="Art Store"
        description="Browse and buy original paintings, digital art, and artwork from emerging and established artists. Secure transactions, worldwide shipping."
        keywords="art store, buy paintings, buy digital art, online art gallery, artwork for sale"
        canonical="https://artartist.com/art"
      />
      <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="bg-black py-5 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="w-full max-w-6xl mx-auto text-center">
          {/* Back Button */}
          <div className="flex justify-start mb-3 sm:mb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Home</span>
            </Link>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-1.5 sm:mb-2"><span className="text-white">ART </span><span className="text-red-600">SHOWCASE</span></h1>
          <p className="text-gray-300 text-sm sm:text-base">Explore posted artworks from community</p>
          

        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden">
        {/* Search and Filter Bar */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for art, artists, or styles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-sm text-sm sm:text-base"
              />
              {/* Search suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3">
                    Matching Artworks & Artists
                  </div>
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchTerm(sug);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center justify-between text-sm text-gray-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span className="font-semibold group-hover:text-red-600 transition-colors">{sug}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">Search</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {pills.map((category) => (
              <button
                key={category}
                onClick={() => handlePillClick(category)}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  category === selectedPill
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid — Pinterest-style masonry */}
        <div id="art-grid-container" className="scroll-mt-6">
        {initialError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto bg-neutral-50 border border-neutral-100 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <X size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Too Many Requests</h3>
            <p className="text-gray-500 text-sm mb-6">
              The server has temporarily rate-limited your IP address. Please wait a few minutes and try again.
            </p>
            <button
              onClick={() => setSelectedPill(selectedPill)}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <StableMasonryGrid
            products={filteredProducts}
            loading={loading}
            columnCount={columnCount}
            onOpenPreview={handleOpenPreview}
            onShare={handleShare}
            onBuyArtwork={handleBuyArtwork}
          />
        )}
        </div>

        {/* Infinite Scroll Observer Target */}
        <div ref={observerTarget} className="w-full flex flex-col items-center justify-center py-10 mt-6 border-t border-gray-100">
          {loadingMore && (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading more artworks...</p>
            </div>
          )}
          {errorLoadingMore && !loadingMore && (
            <div className="flex flex-col items-center gap-3 text-center px-4 max-w-md">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-1">
                <X size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-800">Failed to load more artworks</p>
              <p className="text-xs text-gray-500">The request was rate limited or timed out. Please try again.</p>
              <button 
                onClick={loadMoreProducts}
                className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-red-500/20 active:scale-95"
              >
                Retry Loading
              </button>
            </div>
          )}
          {!hasMore && !errorLoadingMore && products.length > 0 && (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Palette size={24} className="text-gray-300 animate-bounce" />
              <p className="text-xs font-bold uppercase tracking-widest">You've reached the end of the collection</p>
            </div>
          )}
        </div>
      </div>

      {/* Showcase Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClosePreview} />
          
          <div className="relative bg-white w-full max-w-6xl h-[95vh] md:h-[85vh] mx-auto rounded-t-[32px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-500 scale-in-center">
            {/* Left: Image Side */}
            <div className="md:w-3/5 lg:w-2/3 h-[45vh] md:h-full bg-neutral-950 flex items-center justify-center relative group">
              <img
                src={previewItem?.images?.[0]?.url}
                alt={previewItem?.name}
                className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              <div className="absolute top-6 right-6 flex gap-3 z-10">
                <button
                  onClick={() => handleShare(previewItem)}
                  className="w-12 h-12 bg-black/40 backdrop-blur-xl hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-95"
                  title="Share Individual Artwork"
                >
                  <Share2 size={24} />
                </button>
              </div>
              
              <button
                onClick={handleClosePreview}
                className="absolute top-6 left-6 w-12 h-12 bg-black/40 backdrop-blur-xl hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all md:hidden z-10 border border-white/20"
              >
                <X size={24} />
              </button>
            </div>

            {/* Right: Details Side */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Header */}
              <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {previewItem.category}
                      </span>
                      {previewItem.status === 'available' && (
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                          Available
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 md:mb-1">{previewItem.name}</h2>
                  </div>
                  <div className="hidden md:flex gap-2 ml-4">
                    <button
                      onClick={() => handleShare(previewItem)}
                      className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                      title="Share Individual Artwork"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={handleClosePreview}
                      className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Mobile Priority Info - Always visible without scroll */}
                <div className="space-y-4 md:hidden">
                  <button
                    onClick={() => setPreviewArtist(getArtistData(previewItem))}
                    className="w-full flex items-center gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 text-left active:scale-[0.98] transition-transform duration-200 cursor-pointer"
                  >
                    <div className="relative">
                      {getArtistData(previewItem).imageUrl ? (
                        <img
                          src={getArtistData(previewItem).imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                          <User size={18} />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-0.5">Created By</div>
                      <div className="font-bold text-sm text-gray-900 truncate">
                        {getArtistData(previewItem).name}
                      </div>
                      <div className="text-[9px] text-gray-500 flex items-center gap-1 truncate">
                        <MapPin size={8} />
                        {getArtistData(previewItem).location}
                      </div>
                    </div>
                  </button>
                  <div>
                    <h3 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">The Story Behind</h3>
                    <p className="text-gray-600 text-xs font-medium line-clamp-2 leading-relaxed">
                      {previewItem.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="hidden md:block flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                {/* Artist Info */}
                <div className="bg-neutral-50 rounded-[24px] p-5 md:p-6 border border-neutral-100">
                  <button
                    onClick={() => setPreviewArtist(getArtistData(previewItem))}
                    className="flex items-center gap-4 w-full group text-left"
                  >
                    <div className="relative">
                      {getArtistData(previewItem).imageUrl ? (
                        <img
                          src={getArtistData(previewItem).imageUrl}
                          alt={getArtistData(previewItem).imageAlt}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 shadow-inner">
                          <User size={24} />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-0.5">Created By</div>
                      <div className="font-bold text-lg text-gray-900 truncate group-hover:text-red-600 transition-colors">
                        {getArtistData(previewItem).name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={10} />
                        {getArtistData(previewItem).location || 'Global Artist'}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">The Story Behind</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                    {previewItem.description || "No description provided for this artwork."}
                  </p>
                </div>

                {/* Tags/Details */}
                {previewItem.tags && previewItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {previewItem.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Buy and Contact */}
              <div className="p-6 md:p-8 bg-white border-t border-gray-100 mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                {previewItem.status === 'available' && previewItem.price > 0 && (
                  <button
                    onClick={() => handleBuyArtwork(previewItem)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 mb-3"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Buy Artwork — ₹{Number(previewItem.price).toLocaleString('en-IN')}</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: '/art' } });
                      return;
                    }

                    const artistInfo = previewItem?.artistProfile || previewItem?.artist;
                    if (artistInfo) {
                      navigate('/dashboard', { 
                        state: { 
                          startChatWith: {
                            _id: artistInfo._id,
                            name: artistInfo.name || artistInfo.displayName,
                            image: artistInfo.image?.url || artistInfo.photoURL,
                            email: artistInfo.email
                          } 
                        } 
                      });
                    } else {
                      alert('Artist contact information not available');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 group"
                >
                  <Briefcase className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Hire Artist for Inquiries</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewArtist && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={() => setPreviewArtist(null)} />
          <div className="relative bg-white w-full max-w-md max-h-[90vh] mx-auto rounded-[40px] shadow-2xl overflow-hidden flex flex-col scale-in-center">
            {/* Profile Cover */}
            <div className="h-32 bg-gradient-to-br from-red-600 to-red-800 relative">
              <button
                onClick={() => setPreviewArtist(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="px-8 pb-8 flex flex-col items-center">
              {/* Profile Image */}
              <div className="relative -mt-16 mb-4">
                {previewArtist.imageUrl ? (
                  <img
                    src={previewArtist.imageUrl}
                    alt={previewArtist.imageAlt}
                    className="w-32 h-32 rounded-[32px] object-cover border-8 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[32px] bg-gray-100 flex items-center justify-center text-gray-400 border-8 border-white shadow-xl">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute -bottom-1 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </div>

              {/* Name & Title */}
              <h2 className="text-2xl font-black text-gray-900 mb-1">{previewArtist.name}</h2>
              <p className="text-red-600 font-bold text-sm mb-4 uppercase tracking-widest">{previewArtist.artForm || 'Artist'}</p>
              
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-6">
                <MapPin size={14} className="text-red-500" />
                <span>{previewArtist.location || 'Based in India'}</span>
              </div>

              {/* Bio */}
              <div className="w-full mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Biography</h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                  {previewArtist.bio || 'This artist has not added a bio yet.'}
                </p>
              </div>

              {/* Socials & Action */}
              <div className="w-full space-y-4">
                <div className="flex justify-center gap-3">
                  {previewArtist.social?.instagram && (
                    <a href={previewArtist.social.instagram.startsWith('http') ? previewArtist.social.instagram : `https://instagram.com/${previewArtist.social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-900 transition-all">
                      <Instagram size={18} />
                    </a>
                  )}
                  {previewArtist.social?.facebook && (
                    <a href={previewArtist.social.facebook.startsWith('http') ? previewArtist.social.facebook : `https://facebook.com/${previewArtist.social.facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-900 transition-all">
                      <Facebook size={18} />
                    </a>
                  )}
                  {previewArtist.social?.twitter && (
                    <a href={previewArtist.social.twitter.startsWith('http') ? previewArtist.social.twitter : `https://x.com/${previewArtist.social.twitter}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-900 transition-all" title="X">
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-black fill-current">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {previewArtist.social?.website && (
                    <a href={previewArtist.social.website.startsWith('http') ? previewArtist.social.website : `https://${previewArtist.social.website}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-900 transition-all">
                      <Globe size={18} />
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => window.location.href = `/artist/${previewItem?.artistProfile?._id || previewItem?.artist?._id}`}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black transition-all hover:bg-neutral-800 shadow-xl active:scale-[0.98]"
                >
                  View Full Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Art Share Modal */}
      {shareModalProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShareModalProduct(null)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10 space-y-6 scale-in-center">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Share2 size={20} className="text-red-600" />
                Share Artwork
              </h3>
              <button
                onClick={() => setShareModalProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Artwork Info Preview */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <img
                src={shareModalProduct.images?.[0]?.url || shareModalProduct.image?.url}
                alt={shareModalProduct.name}
                className="w-16 h-16 rounded-xl object-cover border border-white shadow-sm flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 text-sm truncate">{shareModalProduct.name}</h4>
                <p className="text-xs text-gray-500 truncate">By {getArtistData(shareModalProduct).name}</p>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">{shareModalProduct.category}</p>
              </div>
            </div>

            {/* Copy Link Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Direct Artwork Link</label>
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-gray-200">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/art?id=${shareModalProduct._id || shareModalProduct.id}`}
                  className="bg-transparent text-xs text-gray-700 flex-1 outline-none truncate px-2 font-mono"
                />
                <button
                  onClick={() => {
                    handleShare(shareModalProduct, 'copy');
                    setShareModalProduct(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1 active:scale-95 flex-shrink-0"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>

            {/* Social Sharing Icons */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-3">Share To Socials</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleShare(shareModalProduct, 'whatsapp')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl border border-green-200 transition-all active:scale-95"
                >
                  <MessageCircle size={24} />
                  <span className="text-xs font-bold">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare(shareModalProduct, 'twitter')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl border border-gray-200 transition-all active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-xs font-bold">X (Twitter)</span>
                </button>
                <button
                  onClick={() => handleShare(shareModalProduct, 'facebook')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-200 transition-all active:scale-95"
                >
                  <Facebook size={24} />
                  <span className="text-xs font-bold">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll To Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 animate-in fade-in slide-in-from-bottom-5"
          title="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl border border-gray-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check size={18} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cashfree E-Commerce Purchase Modal */}
      {buyModal.open && buyModal.product && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider mb-1">
                    <Store size={14} />
                    <span>Official Artwork Purchase</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{buyModal.product.name}</h3>
                  <p className="text-red-100 text-xs mt-0.5">
                    By {buyModal.product?.artistProfile?.name || buyModal.product?.artist?.displayName || 'Artist'}
                  </p>
                </div>
                {buyModal.product.price > 0 && (
                  <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-right">
                    <div className="text-[10px] uppercase font-bold text-red-100">Price</div>
                    <div className="text-lg font-black text-white">₹{Number(buyModal.product.price).toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBuySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={buyForm.name}
                  onChange={(e) => setBuyForm({ ...buyForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={buyForm.email}
                    onChange={(e) => setBuyForm({ ...buyForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyForm.phone}
                    onChange={(e) => setBuyForm({ ...buyForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={buyForm.address}
                  onChange={(e) => setBuyForm({ ...buyForm, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Street, City, State, PIN code"
                />
              </div>

              {buyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
                  {buyError}
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBuyModal({ open: false, product: null })}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={buyLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {buyLoading ? (
                    <span>Opening Gateway...</span>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Pay ₹{Number(buyModal.product.price || 0).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400 font-medium">
                <span>🔒 Secured via Cashfree Payment Gateway</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ArtStore;
