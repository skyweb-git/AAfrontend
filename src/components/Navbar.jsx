import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Plus, MessageSquare, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutFirebase } from '../firebase';
import logo from './aa logos_20250926_144624_0000.png';
import NavHeader from './ui/nav-header';
import AnnouncementBar from './AnnouncementBar';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/art', label: 'Art' },
    { to: '/', label: 'Artist' },
    { to: '/events', label: 'Events' },
    { to: '/art-district', label: 'ArtDistrict' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 relative z-50 shadow-sm">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20 relative">
          {/* Logo - Fixed width left section */}
          <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:w-[320px] lg:flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="ArtArtist"
                className="w-9 h-9 md:w-10 md:h-10 object-cover"
              />
              <div className="text-lg md:text-2xl font-bold leading-none whitespace-nowrap">
                <span className="text-brand">ART</span>
                <span className="text-black">ARTIST</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Absolutely centered on screen */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <NavHeader onAccountClick={() => setIsLoginModalOpen(true)} />
          </div>

          {/* Right Side - Fixed width right section */}
          <div className="hidden lg:flex items-center justify-end w-[320px] flex-shrink-0 space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 rounded-full border border-gray-200 p-1 hover:bg-gray-50 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100] overflow-hidden">
                  <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <Plus size={18} />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <Link 
                      to="/artist/dashboard"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      <span>Artist Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span>Messages</span>
                    </Link>

                    <Link 
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>

                    <div className="border-t border-gray-50 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-700 hover:text-black text-sm font-medium transition-colors px-2 py-1 cursor-pointer whitespace-nowrap"
                >
                  ACCOUNT
                </button>
                <Link to="/artist-hub" className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap">
                  JOINNN...
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button - Absolutely positioned on right */}
          <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-3 pb-4 space-y-2 bg-white border-t border-gray-200">
          {/* Mobile Navigation Links */}
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'text-white bg-brand border border-brand' : 'text-gray-700 hover:text-black hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-3"></div>
          
          {/* Mobile Account Actions */}
          {isAuthenticated ? (
            <>
              {/* Admin Dashboard Link */}
              {user?.role === 'admin' && (
                <>
                  <Link 
                    to="/product-management"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus size={16} />
                    Add Product
                  </Link>
                  <Link 
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} />
                    Admin Dashboard
                  </Link>
                </>
              )}
              <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all duration-300">
                <button 
                  onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 outline-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isProfileExpanded ? 'rotate-180' : ''}`} 
                  />
                </button>

                <div className={`grid grid-cols-1 gap-1 transition-all duration-300 overflow-hidden ${isProfileExpanded ? 'max-h-[300px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <Link 
                    to="/artist/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProfileExpanded(false);
                    }}
                  >
                    <LayoutDashboard size={18} />
                    <span>Artist Dashboard</span>
                  </Link>

                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProfileExpanded(false);
                    }}
                  >
                    <MessageSquare size={18} />
                    <span>Messages</span>
                  </Link>

                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProfileExpanded(false);
                    }}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileExpanded(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors w-full text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/artist/dashboard"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 transition-colors w-full text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard size={16} />
                Artist Dashboard
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 transition-colors w-full text-left"
              >
                <User size={16} />
                Account
              </button>
              <Link
                to="/artist-hub"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                JOINNN...
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
    
    {/* Login Modal */}
    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
    />
    </>
  );
};

export default Navbar;
