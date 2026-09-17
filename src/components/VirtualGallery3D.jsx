import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VirtualGallery3D = () => {
  const navigate = useNavigate();
  const museumUrl = 'https://extranl-musem.vercel.app/';

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
          
          <h1 className="text-4xl font-bold mb-2"><span className="text-white">VIRTUAL </span><span className="text-red-600">3D GALLERY</span></h1>
          <p className="text-gray-300">Explore immersive 3D art exhibitions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mt-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <a
              href={museumUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 w-fit"
            >
              Open in new tab
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="rounded-2xl border-4 border-black overflow-hidden bg-black">
          <iframe
            title="3D Virtual Gallery"
            src={museumUrl}
            className="w-full h-[78vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default VirtualGallery3D;
