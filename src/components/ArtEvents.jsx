import React from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtEvents = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Black Background */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <h1 className="text-4xl font-bold mb-2"><span className="text-white">ART </span><span className="text-red-600">EVENTS</span></h1>
          <p className="text-gray-300">Discover exhibitions, workshops, and networking opportunities in your area. Connect with artists and grow your creative journey.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-red-500 to-red-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                  <span className="text-white font-semibold">Upcoming Exhibition</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Art Showcase</h3>
                <p className="text-gray-600 mb-4">Join us for an exclusive showcase of contemporary works from emerging artists.</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>New York Gallery</span>
                  <span className="mx-2">•</span>
                  <span className="text-red-600 font-semibold">Dec 15, 2024</span>
                </div>
                <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Register Now
                </button>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                  <span className="text-white font-semibold">Artist Workshop</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Art Techniques</h3>
                <p className="text-gray-600 mb-4">Learn cutting-edge digital art creation techniques from industry professionals.</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>Online Workshop</span>
                  <span className="mx-2">•</span>
                  <span className="text-red-600 font-semibold">Dec 20, 2024</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Workshop
                </button>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-green-500 to-green-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                  <span className="text-white font-semibold">Networking Night</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Creative Networking</h3>
                <p className="text-gray-600 mb-4">Connect with fellow artists and industry professionals in a relaxed atmosphere.</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Users size={16} />
                  <span>Art District</span>
                  <span className="mx-2">•</span>
                  <span className="text-red-600 font-semibold">Dec 22, 2024</span>
                </div>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Attend Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[4, 5, 6].map((event) => (
              <div key={event} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery Opening</h3>
                <p className="text-gray-600 mb-4">Experience new collections and meet the artists behind these remarkable works.</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Dec {10 + event}, 2024</span>
                  <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtEvents;
