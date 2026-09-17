import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import SEO from './SEO';
import Chatbot from './Chatbot';

const Home = () => {
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ArtArtist",
    "url": "https://artartist.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://artartist.com/artists?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ArtArtist",
    "url": "https://artartist.com",
    "logo": "https://artartist.com/logo.png",
    "description": "India's premier art marketplace connecting artists with collectors",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/artartist",
      "https://www.instagram.com/artartist",
      "https://www.twitter.com/artartist"
    ]
  };

  return (
    <>
      <SEO 
        title="Home"
        description="Discover unique artwork from talented Indian artists. Buy paintings, digital art, NFTs, and more on ArtArtist - India's premier art marketplace."
        keywords="art marketplace, buy art online, indian artists, paintings for sale, digital art, nft marketplace"
        canonical="https://artartist.com"
        schema={[homeSchema, organizationSchema]}
      />
      <div className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <Footer />
        <Chatbot />
      </div>
    </>
  );
};

export default Home;
