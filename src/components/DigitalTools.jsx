import React, { useEffect } from 'react';

const DigitalTools = () => {
  useEffect(() => {
    document.title = 'Digital Tools - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Explore cutting-edge digital art tools, software, and resources for modern digital artists and creators.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const digitalTools = [
    {
      category: 'Digital Art Software',
      items: [
        { name: 'Adobe Creative Cloud', description: 'Complete suite for digital artists including Photoshop, Illustrator, and more', price: 'Member discount available' },
        { name: 'Procreate', description: 'Powerful digital painting app for iPad artists', price: '?999 one-time' },
        { name: 'Clip Studio Paint', description: 'Professional comic and manga creation software', price: 'Starting from ?2,299' },
        { name: 'Krita', description: 'Free and open-source digital painting program', price: 'Free' }
      ]
    },
    {
      category: '3D Modeling Tools',
      items: [
        { name: 'Blender', description: 'Professional 3D creation suite for modeling, animation, and rendering', price: 'Free' },
        { name: 'ZBrush', description: 'Industry-standard digital sculpting software', price: 'Starting from ?7,999' },
        { name: 'Autodesk Maya', description: 'Professional 3D animation and modeling software', price: 'Educational licenses available' },
        { name: 'Cinema 4D', description: 'Professional 3D motion graphics software', price: 'Member pricing available' }
      ]
    },
    {
      category: 'Graphic Design Tools',
      items: [
        { name: 'Figma', description: 'Collaborative interface design tool for teams', price: 'Free tier available' },
        { name: 'Canva Pro', description: 'Easy-to-use design platform for artists and creators', price: 'Member discount available' },
        { name: 'Affinity Designer', description: 'Professional graphic design software', price: '?3,999 one-time' },
        { name: 'Sketch', description: 'Digital design platform for UI/UX artists', price: 'Starting from ?999/year' }
      ]
    },
    {
      category: 'Animation & Video',
      items: [
        { name: 'Adobe After Effects', description: 'Motion graphics and visual effects software', price: 'Member discount available' },
        { name: 'Toon Boom Harmony', description: 'Professional 2D animation software', price: 'Educational pricing available' },
        { name: 'DaVinci Resolve', description: 'Professional video editing and color grading', price: 'Free version available' },
        { name: 'Adobe Premiere Pro', description: 'Professional video editing software', price: 'Member discount available' }
      ]
    }
  ];

  const resources = [
    {
      title: 'Digital Art Tutorials',
      description: 'Comprehensive tutorials for all skill levels',
      features: ['Video tutorials', 'Step-by-step guides', 'Live sessions', 'Community support']
    },
    {
      title: 'Asset Libraries',
      description: 'Premium digital assets for your projects',
      features: ['Brushes and textures', '3D models', 'Stock photos', 'Vector graphics']
    },
    {
      title: 'Cloud Storage',
      description: 'Secure cloud storage for your digital artwork',
      features: ['Unlimited storage', 'Version control', 'Collaboration tools', 'Auto-backup']
    },
    {
      title: 'Portfolio Platform',
      description: 'Professional portfolio hosting for artists',
      features: ['Custom galleries', 'E-commerce integration', 'Analytics', 'SEO optimization']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Digital Tools</h1>
          <p className="text-xl md:text-2xl mb-8">Cutting-edge digital tools for modern artists</p>
          <p className="text-lg max-w-3xl mx-auto">Empower your creativity with our curated collection of digital art software, tools, and resources designed for artists at every level.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured Tools */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Popular Digital Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {digitalTools.map((category, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6 hover:bg-opacity-90 transition-all duration-300">
                <h3 className="text-xl font-semibold text-red-400 mb-4">{category.category}</h3>
                <p className="text-gray-400 mb-4">Professional tools for {category.category.toLowerCase()}</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Explore Tools
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Tools Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Complete Digital Toolkit</h2>
          <div className="space-y-8">
            {digitalTools.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-bold text-red-400 mb-6">{category.category}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                      <h4 className="text-lg font-semibold text-white mb-2">{item.name}</h4>
                      <p className="text-gray-400 mb-3">{item.description}</p>
                      <p className="text-red-400 font-semibold">{item.price}</p>
                      <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Learn More
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Digital Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-3">{resource.title}</h3>
                <p className="text-gray-400 mb-4">{resource.description}</p>
                <ul className="space-y-2">
                  {resource.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-300">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Member Benefits */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Member Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Discounts</h3>
              <p>Up to 40% off on premium digital art software and tools</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Free Training</h3>
              <p>Complimentary access to digital art workshops and tutorials</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
              <p>Dedicated technical support for all digital tools</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DigitalTools;
