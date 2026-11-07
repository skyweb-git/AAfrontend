import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonical, 
  schema,
  noIndex = false,
  type = 'website'
}) => {
  const brand = 'ArtArtist';
  const siteTitle = title
    ? (title.includes(brand) ? title : `${title} | ${brand}`)
    : 'Hire an Artist Online | Find & Commission Artists Globally | ArtArtist';
  const siteDescription = description || 'Hire verified artists worldwide for custom commissions, murals, portraits, digital art, and more. Search by name, art form, or city on ArtArtist.';
  const siteKeywords = keywords || 'hire artist, hire an artist, hire artist online, commission an artist, artist for hire, find artists, freelance artist, hire painter, hire mural artist, hire digital artist';
  const siteImage = ogImage || 'https://artartist.com/og-default.jpg';
  const siteUrl = canonical || 'https://artartist.com';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="author" content="ArtArtist" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color" content="#B21717" />

      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ArtArtist" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="en_IN" />
      <meta property="og:locale:alternate" content="en_GB" />

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
