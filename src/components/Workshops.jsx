import React, { useEffect } from 'react';

const Workshops = () => {
  useEffect(() => {
    document.title = 'Workshops - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Join art workshops and training programs for artists of all skill levels. Learn from experienced artists and professionals.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const workshops = [
    {
      title: 'Fundamentals of Drawing',
      instructor: 'Rajesh Kumar',
      duration: '6 weeks',
      level: 'Beginner',
      price: '?4,999',
      schedule: 'Weekend batches',
      description: 'Master the basics of drawing with comprehensive lessons on line, form, and perspective.',
      topics: ['Basic shapes and forms', 'Light and shadow', 'Perspective drawing', 'Human anatomy basics']
    },
    {
      title: 'Digital Art Mastery',
      instructor: 'Priya Sharma',
      duration: '8 weeks',
      level: 'Intermediate',
      price: '?7,999',
      schedule: 'Evening classes',
      description: 'Transition from traditional to digital art with professional techniques and tools.',
      topics: ['Digital painting techniques', 'Color theory for digital art', 'Character design', 'Portfolio development']
    },
    {
      title: 'Oil Painting Techniques',
      instructor: 'Anand Patel',
      duration: '10 weeks',
      level: 'Advanced',
      price: '?12,999',
      schedule: 'Weekday batches',
      description: 'Advanced oil painting techniques for experienced artists looking to refine their skills.',
      topics: ['Advanced color mixing', 'Glazing techniques', 'Texture creation', 'Contemporary styles']
    },
    {
      title: 'Watercolor Landscapes',
      instructor: 'Meera Reddy',
      duration: '4 weeks',
      level: 'All Levels',
      price: '?3,499',
      schedule: 'Weekend workshops',
      description: 'Capture the beauty of landscapes through the transparent medium of watercolors.',
      topics: ['Wet-on-wet techniques', 'Landscape composition', 'Atmospheric effects', 'Color harmonies']
    }
  ];

  const upcomingWorkshops = [
    {
      title: 'Portrait Photography',
      date: 'June 15-16, 2025',
      instructor: 'Vikram Singh',
      price: '?2,999',
      spots: 'Limited to 15 participants'
    },
    {
      title: 'Sculpture Basics',
      date: 'June 22-23, 2025',
      instructor: 'Sunita Rao',
      price: '?3,499',
      spots: 'Limited to 10 participants'
    },
    {
      title: 'Abstract Expressionism',
      date: 'June 29-30, 2025',
      instructor: 'Amit Desai',
      price: '?2,499',
      spots: 'Limited to 20 participants'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Art Workshops</h1>
          <p className="text-xl md:text-2xl mb-8">Learn, Create, and Grow with Expert Artists</p>
          <p className="text-lg max-w-3xl mx-auto">Join our comprehensive workshops designed for artists at every skill level. Learn from experienced professionals and take your artistic journey to new heights.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured Workshops */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Featured Workshops</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {workshops.map((workshop, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8 hover:bg-opacity-90 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-red-400">{workshop.title}</h3>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">{workshop.level}</span>
                </div>
                <p className="text-gray-300 mb-4">{workshop.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Instructor</p>
                    <p className="font-semibold">{workshop.instructor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-semibold">{workshop.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Schedule</p>
                    <p className="font-semibold">{workshop.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="font-semibold text-red-400">{workshop.price}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">What You'll Learn:</h4>
                  <ul className="space-y-2">
                    {workshop.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center text-gray-300">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Workshops */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Upcoming Weekend Workshops</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingWorkshops.map((workshop, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-3">{workshop.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-300"><span className="font-semibold">Date:</span> {workshop.date}</p>
                  <p className="text-gray-300"><span className="font-semibold">Instructor:</span> {workshop.instructor}</p>
                  <p className="text-gray-300"><span className="font-semibold">Price:</span> {workshop.price}</p>
                  <p className="text-gray-300"><span className="font-semibold">Availability:</span> {workshop.spots}</p>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Register
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Workshop Benefits */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Why Choose Our Workshops?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-gray-400">Learn from renowned artists with years of professional experience and teaching expertise.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Small Batch Sizes</h3>
              <p className="text-gray-400">Personalized attention with limited batch sizes ensuring quality learning experience.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Certificate of Completion</h3>
              <p className="text-gray-400">Receive recognized certificates upon successful completion of workshops.</p>
            </div>
          </div>
        </section>

        {/* Member Benefits */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Member Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">50% Discount</h3>
              <p>Lifetime members get 50% off on all workshop fees</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Priority Booking</h3>
              <p>Early access to workshop registrations before general public</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Free Materials</h3>
              <p>Complimentary art supplies for selected workshops</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Workshops;
