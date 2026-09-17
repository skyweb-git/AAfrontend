import React, { useEffect } from 'react';

const PressKit = () => {
  useEffect(() => {
    document.title = 'Press Kit - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'art artist press kit with brand assets, company information, and media resources for journalists and partners.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const brandAssets = [
    {
      name: 'Logo - Primary',
      description: 'Official art artist logo in color format',
      format: 'SVG, PNG',
      download: '#'
    },
    {
      name: 'Logo - Monochrome',
      description: 'Black and white version of the logo',
      format: 'SVG, PNG',
      download: '#'
    },
    {
      name: 'Brand Guidelines',
      description: 'Complete brand usage guidelines and style guide',
      format: 'PDF',
      download: '#'
    },
    {
      name: 'Brand Colors',
      description: 'Official color palette and usage guidelines',
      format: 'ASE, PDF',
      download: '#'
    }
  ];

  const mediaCoverage = [
    {
      publication: 'The Hindu',
      title: 'art artist Revolutionizes Art Community in India',
      date: 'March 15, 2025',
      link: '#',
      category: 'Print Media'
    },
    {
      publication: 'TechCrunch India',
      title: 'How art artist is Building the Future of Art Marketplaces',
      date: 'February 28, 2025',
      link: '#',
      category: 'Online Media'
    },
    {
      publication: 'YourStory',
      title: 'Uday Kumar Sangisetti: Empowering Artists Through Technology',
      date: 'February 10, 2025',
      link: '#',
      category: 'Online Media'
    },
    {
      publication: 'Times of India',
      title: 'Art Marketplaces: The New Frontier for Indian Artists',
      date: 'January 25, 2025',
      link: '#',
      category: 'Print Media'
    }
  ];

  const companyInfo = {
    founded: '2023',
    headquarters: 'Hyderabad, India',
    teamSize: '25+',
    artistsServed: '10,000+',
    eventsConducted: '50+',
    statesPresence: '15+'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Press Kit</h1>
          <p className="text-xl md:text-2xl mb-8">Media Resources & Brand Information</p>
          <p className="text-lg max-w-3xl mx-auto">Welcome to the art artist press kit. Find all the resources you need for media coverage, brand partnerships, and story opportunities.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Facts */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Company Overview</h2>
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.founded}</h3>
                <p className="text-gray-400">Founded</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.headquarters}</h3>
                <p className="text-gray-400">Headquarters</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.teamSize}</h3>
                <p className="text-gray-400">Team Size</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.artistsServed}</h3>
                <p className="text-gray-400">Artists Served</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.eventsConducted}</h3>
                <p className="text-gray-400">Events Conducted</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">{companyInfo.statesPresence}</h3>
                <p className="text-gray-400">States Presence</p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Our Story</h2>
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-4">
                Founded in 2023 by Uday Kumar Sangisetti, art artist emerged from a simple vision: to create a comprehensive ecosystem that empowers artists across India. What started as a small community initiative has grown into a nationwide platform serving over 10,000 artists.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                Our mission is to bridge the gap between traditional art and modern technology, providing artists with the tools, resources, and opportunities they need to thrive in today's digital world. From art supplies and digital tools to workshops and studio spaces, we've built a complete ecosystem that supports artists at every stage of their journey.
              </p>
              <p className="text-lg text-gray-300">
                Today, art artist operates across 15+ states, conducts regular art events, and continues to innovate new ways to support the creative community. We believe that art has the power to transform lives, and we're committed to making art accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Brand Assets</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {brandAssets.map((asset, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{asset.name}</h3>
                <p className="text-gray-400 mb-3">{asset.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Format: {asset.format}</span>
                  <a href={asset.download} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Coverage */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Media Coverage</h2>
          <div className="space-y-4">
            {mediaCoverage.map((coverage, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6 hover:bg-opacity-90 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{coverage.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                      <span>{coverage.publication}</span>
                      <span>{coverage.date}</span>
                      <span className="bg-gray-800 px-2 py-1 rounded">{coverage.category}</span>
                    </div>
                  </div>
                  <a href={coverage.link} className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Read Article
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership Team */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Leadership Team</h2>
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-red-400">UKS</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Uday Kumar Sangisetti</h3>
                <p className="text-red-400 mb-3">Founder & CEO</p>
                <p className="text-gray-400">Visionary leader with a passion for art and technology. Uday founded art artist with the mission to democratize art access across India.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-4">Key Achievements</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Built a platform serving 10,000+ artists across India
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Organized 50+ successful art events and exhibitions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Established partnerships with major art institutions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Recognized as a thought leader in art technology
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Media Contact</h2>
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">For Media Inquiries</h3>
                <div className="space-y-3">
                  <p className="text-gray-300">
                    <span className="font-semibold">Contact Person:</span> Media Relations Team
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Email:</span> media@artartist.in
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Phone:</span> +91 73865 60012
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold">Response Time:</span> Within 24 hours
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Story Angles & Topics</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    The rise of art marketplaces in India
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Technology democratizing art access
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Success stories of Indian artists
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                    Art education and community building
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Download All Assets */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Download Complete Press Kit</h2>
          <p className="mb-6">Get all brand assets, company information, and media resources in one comprehensive package.</p>
          <button className="bg-white text-red-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
            Download Full Press Kit
          </button>
        </section>
      </div>
    </div>
  );
};

export default PressKit;
