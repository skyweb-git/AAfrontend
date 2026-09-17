import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './contexts/CartContext';
import AuthProvider from './contexts/AuthContext';
import ArtStore from './components/ArtStore';
import ArtistsPage from './components/ArtistsPage';
import ArtistHub from './components/ArtistHub';
import NFTPage from './components/NFTPage';
import EventsPage from './components/EventsPage';
import AboutPage from './components/AboutPage';
import FirebaseAuth from './components/FirebaseAuth';
import Signup from './components/Signup';
import VirtualGallery3D from './components/VirtualGallery3D';
import ArtEvents from './components/ArtEvents';
import Terms from './components/Terms';
import ArtValueCalculator from './components/ArtValueCalculator';
import DigitalTools from './components/DigitalTools';
import Workshops from './components/Workshops';
import StudioFinder from './components/StudioFinder';
import Careers from './components/Careers';
import PressKit from './components/PressKit';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import Disclaimer from './components/Disclaimer';
import ProductManagement from './components/ProductManagement';
import EventManagement from './components/EventManagement';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import UserDashboard from './components/UserDashboard';
import ArtistProfile from './components/ArtistProfile';
import PageLoader from './components/PageLoader';
import ArtDistrict from './components/ArtDistrict';
import FormPage from './components/FormPage';
// import Cart from './components/Cart';
import { ArtistProvider } from './components/artist/context/ArtistContext';
import ArtistLogin from './components/artist/pages/ArtistLogin';
import ArtistVerifyOTP from './components/artist/pages/ArtistVerifyOTP';
import ArtistDashboard from './components/artist/pages/ArtistDashboard';

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Wrapper component to add loader to each route
const RouteWithLoader = ({ element }) => {
  return (
    <PageLoader>
      {element}
    </PageLoader>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ArtistProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<RouteWithLoader element={<ArtistsPage />} />} />
              <Route path="/art" element={<RouteWithLoader element={<ArtStore />} />} />
              <Route path="/artists" element={<RouteWithLoader element={<ArtistsPage />} />} />
              <Route path="/login" element={<RouteWithLoader element={<FirebaseAuth />} />} />
              <Route path="/signup" element={<RouteWithLoader element={<Signup />} />} />
              <Route path="/artist-hub" element={<RouteWithLoader element={<ArtistHub />} />} />
              <Route path="/nft" element={<RouteWithLoader element={<NFTPage />} />} />
              <Route path="/events" element={<RouteWithLoader element={<EventsPage />} />} />
              <Route path="/art-events" element={<RouteWithLoader element={<ArtEvents />} />} />
              <Route path="/about" element={<RouteWithLoader element={<AboutPage />} />} />
              <Route path="/terms" element={<RouteWithLoader element={<Terms />} />} />
              <Route path="/virtual-gallery" element={<RouteWithLoader element={<VirtualGallery3D />} />} />
              <Route path="/art-value-calculator" element={<RouteWithLoader element={<ArtValueCalculator />} />} />
              <Route path="/digital-tools" element={<RouteWithLoader element={<DigitalTools />} />} />
              <Route path="/workshops" element={<RouteWithLoader element={<Workshops />} />} />
              <Route path="/studio-finder" element={<RouteWithLoader element={<StudioFinder />} />} />
              <Route path="/careers" element={<RouteWithLoader element={<Careers />} />} />
              <Route path="/press-kit" element={<RouteWithLoader element={<PressKit />} />} />
              <Route path="/privacy-policy" element={<RouteWithLoader element={<PrivacyPolicy />} />} />
              <Route path="/cookie-policy" element={<RouteWithLoader element={<CookiePolicy />} />} />
              <Route path="/disclaimer" element={<RouteWithLoader element={<Disclaimer />} />} />
              <Route path="/product-management" element={<RouteWithLoader element={<ProductManagement />} />} />
              <Route path="/event-management" element={<RouteWithLoader element={<EventManagement />} />} />
              <Route path="/admin" element={<RouteWithLoader element={<AdminDashboard />} />} />
              <Route path="/profile" element={<RouteWithLoader element={<UserProfile />} />} />
              <Route path="/dashboard" element={<RouteWithLoader element={<UserDashboard />} />} />
              <Route path="/art-district" element={<RouteWithLoader element={<ArtDistrict />} />} />
              <Route path="/forms/:formId" element={<RouteWithLoader element={<FormPage />} />} />
              <Route path="/artist/login" element={<RouteWithLoader element={<ArtistLogin />} />} />
              <Route path="/artist/verify-otp" element={<RouteWithLoader element={<ArtistVerifyOTP />} />} />
              <Route path="/artist/dashboard" element={<RouteWithLoader element={<ArtistDashboard />} />} />
              <Route path="/artist/:artistId" element={<RouteWithLoader element={<ArtistProfile />} />} />
              {/* Clean username-based artist profile URLs e.g. /udaymicroartist */}
              <Route path="/:artistId" element={<RouteWithLoader element={<ArtistProfile />} />} />
            </Routes>
            {/* <Cart /> */}
          </Router>
          </ArtistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
