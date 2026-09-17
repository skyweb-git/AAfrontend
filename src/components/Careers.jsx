import React, { useEffect, useState } from 'react';

const Careers = () => {
  useEffect(() => {
    document.title = 'Careers - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Join the art artist team. Explore career opportunities in art, technology, and creative industries.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    portfolio: '',
    message: ''
  });

  const openings = [
    {
      title: 'Senior Art Instructor',
      department: 'Education',
      location: 'Hyderabad',
      type: 'Full-time',
      experience: '5+ years',
      description: 'We are looking for an experienced art instructor to lead our workshops and develop curriculum.',
      responsibilities: [
        'Conduct art workshops for various skill levels',
        'Develop and update curriculum',
        'Mentor junior instructors',
        'Collaborate with artists and community'
      ],
      requirements: [
        'Degree in Fine Arts or related field',
        '5+ years of teaching experience',
        'Strong portfolio of artwork',
        'Excellent communication skills'
      ]
    },
    {
      title: 'Digital Marketing Manager',
      department: 'Marketing',
      location: 'Bangalore',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Lead our digital marketing efforts to promote art events and engage with the artist community.',
      responsibilities: [
        'Develop and execute digital marketing strategies',
        'Manage social media campaigns',
        'Create content for various platforms',
        'Analyze marketing metrics and optimize campaigns'
      ],
      requirements: [
        'Experience in digital marketing',
        'Knowledge of art industry preferred',
        'Strong analytical skills',
        'Creative mindset'
      ]
    },
    {
      title: 'Studio Coordinator',
      department: 'Operations',
      location: 'Mumbai',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Manage studio operations and ensure smooth functioning of our creative spaces.',
      responsibilities: [
        'Coordinate studio bookings and schedules',
        'Maintain studio equipment and supplies',
        'Assist artists with studio needs',
        'Handle customer inquiries'
      ],
      requirements: [
        'Experience in operations management',
        'Knowledge of art supplies and equipment',
        'Strong organizational skills',
        'Customer service oriented'
      ]
    },
    {
      title: 'Content Creator',
      department: 'Creative',
      location: 'Remote',
      type: 'Contract',
      experience: '2+ years',
      description: 'Create engaging content about art, artists, and creative processes for our platforms.',
      responsibilities: [
        'Write articles and blog posts about art',
        'Create video content for social media',
        'Interview artists and create profiles',
        'Develop content calendars'
      ],
      requirements: [
        'Strong writing and content creation skills',
        'Knowledge of art and art history',
        'Experience with video production',
        'Social media expertise'
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Careers at art artist</h1>
          <p className="text-xl md:text-2xl mb-8">Join Our Creative Community</p>
          <p className="text-lg max-w-3xl mx-auto">Be part of a team that's passionate about empowering artists across India. We're looking for creative minds who share our vision of making art accessible to everyone.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Why Join Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Why Join art artist?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Creative Environment</h3>
              <p className="text-gray-400">Work in a vibrant, creative atmosphere surrounded by art and artists every day.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
              <p className="text-gray-400">Continuous learning and development opportunities to advance your career.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Impactful Work</h3>
              <p className="text-gray-400">Make a real difference in the lives of artists and creative communities.</p>
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Current Openings</h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-red-400 mb-2">{job.title}</h3>
                    <p className="text-gray-300 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="bg-gray-800 px-3 py-1 rounded">{job.department}</span>
                      <span className="bg-gray-800 px-3 py-1 rounded">{job.location}</span>
                      <span className="bg-gray-800 px-3 py-1 rounded">{job.type}</span>
                      <span className="bg-gray-800 px-3 py-1 rounded">{job.experience}</span>
                    </div>
                  </div>
                  <button className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Apply Now
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Responsibilities:</h4>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, respIndex) => (
                        <li key={respIndex} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Requirements:</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start text-gray-300">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-red-400 mb-8 text-center">Join Our Talent Pool</h2>
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl p-8">
            <p className="text-gray-300 mb-6">Don't see a position that fits? Join our talent pool and we'll reach out when relevant opportunities become available.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Desired Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Position you're interested in"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 3+ years in digital marketing"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Portfolio/Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="Link to your portfolio or website"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Letter*</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us why you'd like to join art artist"
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">Benefits & Perks</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Health & Wellness</h3>
              <p>Comprehensive health insurance and wellness programs</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Creative Freedom</h3>
              <p>Flexible work environment and creative projects</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Professional Growth</h3>
              <p>Training programs and career development opportunities</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Careers;
