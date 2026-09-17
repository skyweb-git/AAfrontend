import React from 'react';
import { ShoppingBag, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cards = ({ hideArtSupplyStore, hideBecomeVerifiedArtist }) => {
  const navigate = useNavigate();
  return (
    <section className="bg-[#f8f9fa] py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* Row 2 - Art Value Calculator & Art Supply Store (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8 md:mb-12">
          {/* Art Value Calculator */}
          <div className="relative bg-[#0A0A0A] p-8 lg:p-10 rounded-[24px] shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left flex flex-col justify-between min-h-[360px]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-red-900/50 to-[#0A0A0A] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10">
              <div className="mb-6 flex justify-start">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-lg shadow-brand/30">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                ART VALUE CALCULATOR
              </h2>

              <p className="text-gray-300 leading-relaxed text-sm md:text-base font-medium">
                Discover the true market value of your artwork. Powered by real market logic — not guesswork. Estimate pricing using demand, brand value, medium, and commission factors.
              </p>
            </div>

            <button
              onClick={() => navigate('/art-value-calculator')}
              className="relative z-10 w-full bg-gradient-to-r from-brand to-red-700 text-white px-6 py-4 rounded-2xl font-bold hover:from-red-700 hover:to-brand transition-all shadow-lg shadow-brand/25 active:scale-95 mt-6 text-center"
            >
              CALCULATE VALUE
            </button>
          </div>

          {/* Art Supply Store */}
          <div className="relative bg-[#0A0A0A] p-8 lg:p-10 rounded-[24px] shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left flex flex-col justify-between min-h-[360px]">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] opacity-[0.08] z-0">
              <ShoppingBag 
                size={240} 
                className="text-red-600"
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-900/20 pointer-events-none z-0" />
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10">
              <div className="mb-6 flex justify-start">
                <span className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full tracking-wider uppercase">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  in progress
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                THE ART SUPPLY STORE
              </h2>

              <p className="text-gray-300 leading-relaxed text-sm md:text-base font-medium">
                Professional grade brushes, canvases, and tools delivered across India with exclusive artist discounts. Buy quality materials curated by experts.
              </p>
            </div>

            <div className="relative z-10 w-full text-left text-white/40 font-bold mt-6 py-4 tracking-wider text-sm">
              coming soon
            </div>
          </div>
        </div>

        {/* Row 3 - ArtDistrict, NFT Launch, and Art Marketplace (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Virtual Gallery */}
          <div className="relative bg-[#0A0A0A] p-6 sm:p-8 rounded-[24px] shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left flex flex-col justify-between min-h-[380px]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-transparent to-red-900/20 pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full tracking-wider uppercase">
                  EXPLORE NOW
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight">
                VIRTUAL GALLERY
              </h2>
              
              <p className="text-gray-400 leading-relaxed text-sm font-medium">
                Explore immersive 3D art exhibitions. Walk through our virtual museum space, interact with stunning masterpieces, and experience art in a new dimension.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/virtual-gallery')}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-red-500/25 active:scale-95 text-center mt-6"
            >
              ENTER GALLERY
            </button>
          </div>

          {/* NFT Launch */}
          <div 
            onClick={() => navigate('/nft')}
            className="relative text-white p-6 sm:p-8 rounded-[24px] shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left flex flex-col justify-between min-h-[380px] cursor-pointer group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=900&fit=crop")'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-red-900/60 to-black/80" />

            <div className="relative z-10">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full tracking-wider uppercase">
                  EXPLORE NOW
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight">
                NFT LAUNCH
              </h2>

              <p className="text-gray-300 leading-relaxed text-sm font-medium">
                Mint your legacy on the blockchain. We are launching digital collectibles with creator royalties and verified ownership.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-6 relative z-10">
              <span className="px-3 py-1.5 bg-white/95 text-red-700 rounded-lg text-[10px] font-bold">
                Polygon Support
              </span>
              <span className="px-3 py-1.5 bg-white/95 text-red-700 rounded-lg text-[10px] font-bold">
                Creator Royalties
              </span>
            </div>
          </div>

          {/* Art Marketplace */}
          <div className="relative bg-[#0A0A0A] p-6 sm:p-8 rounded-[24px] shadow-2xl hover:scale-[1.01] transition-transform duration-300 ease-out overflow-hidden text-left flex flex-col justify-between min-h-[380px] md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-red-950/40 pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full tracking-wider uppercase">
                  WAITLIST
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight">
                MARKETPLACE
              </h2>
              
              <p className="text-gray-400 leading-relaxed text-sm font-medium">
                A revolutionary platform where every brushstroke finds its home. Experience seamless buying, artist royalties, and global shipping.
              </p>
            </div>
            
            <div className="relative z-10 w-full text-left text-white/40 font-bold mt-6 py-4 tracking-wider text-sm">
              coming soon
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Cards;
