import React, { useEffect, useState } from 'react';

const StudioFinder = () => {
  useEffect(() => {
    document.title = 'Studio Finder - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Find art studios and creative spaces across India. Browse studios by location, amenities, and availability.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const studios = [
    {
      name: 'Creative Canvas Studio',
      city: 'Hyderabad',
      area: 'Banjara Hills',
      type: 'Painting Studio',
      price: '?8,000/month',
      size: '500 sq ft',
      amenities: ['Natural lighting', 'Storage space', 'Easel provided', '24/7 access'],
      rating: 4.8,
      available: true,
      image: 'studio1'
    },
    {
      name: 'Digital Art Hub',
      city: 'Bangalore',
      area: 'Indiranagar',
      type: 'Digital Studio',
      price: '?12,000/month',
      size: '400 sq ft',
      amenities: ['High-speed internet', 'Graphics tablets', 'Software licenses', 'Meeting room'],
      rating: 4.9,
      available: true,
      image: 'studio2'
    },
    {
      name: 'Sculpture Space',
      city: 'Mumbai',
      area: 'Bandra',
      type: 'Sculpture Studio',
      price: '?15,000/month',
      size: '800 sq ft',
      amenities: ['Heavy-duty flooring', 'Ventilation', 'Tool storage', 'Loading dock'],
      rating: 4.7,
      available: false,
      image: 'studio3'
    },
    {
      name: 'Photography Studio',
      city: 'Delhi',
      area: 'Hauz Khas',
      type: 'Photography Studio',
      price: '?10,000/month',
      size: '600 sq ft',
      amenities: ['Lighting equipment', 'Backdrops', 'Dark room', 'Props storage'],
      rating: 4.6,
      available: true,
      image: 'studio4'
    },
    {
      name: 'Mixed Media Lab',
      city: 'Chennai',
      area: 'Adyar',
      type: 'Multi-purpose',
      price: '?9,000/month',
      size: '450 sq ft',
      amenities: ['Flexible layout', 'Sink area', 'Storage', 'Parking'],
      rating: 4.5,
      available: true,
      image: 'studio5'
    },
    {
      name: 'Ceramics Workshop',
      city: 'Pune',
      area: 'Koregaon Park',
      type: 'Ceramics Studio',
      price: '?11,000/month',
      size: '700 sq ft',
      amenities: ['Kiln access', 'Clay storage', 'Pottery wheels', 'Glazing area'],
      rating: 4.8,
      available: true,
      image: 'studio6'
    }
  ];

  const cities = ['all', 'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
  const types = ['all', 'Painting Studio', 'Digital Studio', 'Sculpture Studio', 'Photography Studio', 'Multi-purpose', 'Ceramics Studio'];

  const filteredStudios = studios.filter(studio => {
    const cityMatch = selectedCity === 'all' || studio.city === selectedCity;
    const typeMatch = selectedType === 'all' || studio.type === selectedType;
    return cityMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Studio Finder</h1>
          <p className="text-xl md:text-2xl mb-8">Find Your Perfect Creative Space</p>
          <p className="text-lg max-w-3xl mx-auto">Discover art studios and creative spaces across India. Browse our curated selection of studios equipped for every artistic need.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters */}
        <section className="mb-8">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Find Your Studio</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city === 'all' ? 'All Cities' : city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Studio Type</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                >
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Studios Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-400">Available Studios ({filteredStudios.length})</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">List View</button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Map View</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudios.map((studio, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl overflow-hidden hover:bg-opacity-90 transition-all duration-300">
                {/* Studio Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <p className="text-gray-500 text-sm">Studio Image</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{studio.name}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">?</span>
                      <span className="text-sm">{studio.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-300">
                      <span className="font-semibold">Location:</span> {studio.area}, {studio.city}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Type:</span> {studio.type}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Size:</span> {studio.size}
                    </p>
                    <p className="text-red-400 font-semibold">{studio.price}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {studio.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                        <span key={amenityIndex} className="text-xs bg-gray-800 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                      {studio.amenities.length > 3 && (
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                          +{studio.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        studio.available 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!studio.available}
                    >
                      {studio.available ? 'Book Now' : 'Not Available'}
                    </button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Search Studios</h3>
              <p className="text-gray-400">Browse our curated selection of art studios by location and type</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Visit & Choose</h3>
              <p className="text-gray-400">Schedule visits to find the perfect creative space for your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Studio</h3>
              <p className="text-gray-400">Reserve your studio with flexible monthly and yearly plans</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Creating</h3>
              <p className="text-gray-400">Begin your artistic journey in your new creative space</p>
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="mt-12 bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Member Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">20% Discount</h3>
              <p>Special member pricing on all studio bookings</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Priority Access</h3>
              <p>Early access to new studio listings and availability</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Flexible Terms</h3>
              <p>Customized rental terms for long-term projects</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudioFinder;
