import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonical, 
  schema,
  noIndex = false
}) => {
  const siteTitle = title ? `${title} | ArtArtist` : 'ArtArtist - Buy & Sell Art Online | Indian Art Marketplace';
  const siteDescription = description || 'Discover unique artwork from talented Indian artists. Buy paintings, digital art, NFTs, and more on ArtArtist - India\'s premier art marketplace.';
  const siteKeywords = keywords || 'art marketplace, buy art online, indian artists, paintings for sale, digital art, nft marketplace';
  const siteImage = ogImage || 'https://artartist.com/og-default.jpg';
  const siteUrl = canonical || 'https://artartist.com';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="ArtArtist" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ArtArtist" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
