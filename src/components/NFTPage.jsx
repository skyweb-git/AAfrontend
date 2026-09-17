import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, TrendingUp, Shield, Zap, Globe, Users, ChevronRight, Check, ShoppingCart } from 'lucide-react';
import Footer from './Footer';
import Chatbot from './Chatbot';

const NFTPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('what-is-nft');

  const nftExamples = [
    {
      id: 1,
      title: "Bored Ape #3001",
      artist: "Bored Ape Yacht Club",
      owner: "Justin Bieber",
      price: "500 ETH (~$1.3M)",
      image: "https://s.yimg.com/ny/api/res/1.2/.luJNgysQVvz.ov3NJQd9w--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://s.yimg.com/os/creatr-uploaded-images/2022-02/7d56ca60-8b05-11ec-bfea-00835e0dbbb2",
      category: "Profile Picture NFT",
      bought: "Jan 2022",
      likes: 12500,
      note: "Current value reportedly dropped sharply (~$10K-$60K range in bear market periods)."
    },
    {
      id: 2,
      title: "Bored Ape (Eminem)",
      artist: "Bored Ape Yacht Club",
      owner: "Eminem",
      price: "~123 ETH (~$460K)",
      image: "https://images.prestigeonline.com/wp-content/uploads/sites/5/2022/01/06110953/eminem-feature.jpg",
      category: "BAYC",
      bought: "Late 2021",
      likes: 9100,
      note: "Known for traits similar to Eminem style (hoodie + hat)."
    },
    {
      id: 3,
      title: "Bored Ape (Neymar Jr)",
      artist: "Bored Ape Yacht Club",
      owner: "Neymar Jr",
      price: "~160 ETH (~$500K+)",
      image: "https://static.wixstatic.com/media/95db9b_3a3b7f0b79464cfea48d32b55b56d46c~mv2.png/v1/fill/w_631,h_631,al_c,q_90,enc_avif,quality_auto/95db9b_3a3b7f0b79464cfea48d32b55b56d46c~mv2.png",
      category: "BAYC",
      bought: "2022",
      likes: 8700,
      note: "Value dropped heavily after the NFT market crash."
    },
    {
      id: 4,
      title: "CryptoPunk #7804",
      artist: "CryptoPunks",
      owner: "CryptoPunks",
      price: "~4200 ETH (~$7.5M)",
      image: "https://www.larvalabs.com/public/images/cryptopunks/punk7804.png",
      category: "Alien Punk",
      bought: "Historic Sale",
      likes: 22000,
      note: "One of the most famous rare Alien CryptoPunks."
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Ownership & Authenticity",
      description: "Blockchain technology ensures you own the original digital asset with proof of authenticity."
    },
    {
      icon: TrendingUp,
      title: "Investment Potential",
      description: "NFTs can appreciate in value as digital collectibles and art investments."
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Buy, sell, and trade digital art with collectors worldwide 24/7."
    },
    {
      icon: Users,
      title: "Artist Support",
      description: "Directly support artists with royalties on secondary sales."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Digital Art",
      description: "Artists create unique digital artwork using various digital tools and techniques."
    },
    {
      step: 2,
      title: "Mint as NFT",
      description: "Convert the digital art into an NFT by uploading to a blockchain platform."
    },
    {
      step: 3,
      title: "Set Metadata",
      description: "Add details like title, description, and set royalty percentages."
    },
    {
      step: 4,
      title: "List for Sale",
      description: "List the NFT on marketplaces like OpenSea, Rarible, or Foundation."
    }
  ];

  const faqs = [
    {
      question: "What makes NFT art different from regular digital art?",
      answer: "NFT art is blockchain-verified and unique, while regular digital art can be copied infinitely. NFTs provide proof of ownership and authenticity through smart contracts."
    },
    {
      question: "How do I know if an NFT is authentic?",
      answer: "Check the creator's verified wallet address, transaction history on the blockchain, and look for verification badges on reputable marketplaces."
    },
    {
      question: "What can I do with an NFT after buying it?",
      answer: "You can display it in virtual galleries, use it as profile pictures, trade it, or hold it as an investment. You own the digital rights to the artwork."
    },
    {
      question: "Are NFTs environmentally friendly?",
      answer: "Many NFT platforms now use eco-friendly blockchains like Polygon and Tezos, which consume much less energy than older systems."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              NFT <span className="text-red-600">Digital Art</span> Marketplace
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover, collect, and trade unique digital artwork on the blockchain. 
              Join the revolution in digital art ownership.
            </p>
            
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {['what-is-nft', 'examples', 'benefits', 'how-it-works', 'faqs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'what-is-nft' 
                  ? 'What is NFT' 
                  : tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* What is NFT Section */}
        {activeTab === 'what-is-nft' && (
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  What is an <span className="text-red-600">NFT</span>?
                </h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    <strong>NFT</strong> stands for <strong>Non-Fungible Token</strong>. 
                    It's a unique digital certificate of ownership stored on a blockchain.
                  </p>
                  <p>
                    Unlike regular digital files that can be copied endlessly, each NFT is 
                    one-of-a-kind and cannot be replicated. Think of it as a digital 
                    collector's item with verifiable authenticity.
                  </p>
                  <p>
                    Every NFT contains a smart contract that records ownership history and 
                    ensures the creator receives royalties on future sales.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">Key Characteristics:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-red-800"><strong>Unique:</strong> Each NFT is one-of-a-kind</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-red-800"><strong>Verifiable:</strong> Ownership can be proven on blockchain</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-red-800"><strong>Indivisible:</strong> Cannot be split into smaller parts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-red-800"><strong>Transferable:</strong> Can be bought, sold, and traded</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=400&fit=crop"
                    alt="NFT Digital Art"
                    className="rounded-lg shadow-lg w-full"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                    <Shield className="text-red-600" size={20} />
                    <span className="font-semibold text-gray-900">Blockchain Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Art vs Traditional Art */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                NFT Art vs Traditional Digital Art
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border-2 border-red-200 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-red-600 mb-4">NFT Digital Art</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={20} />
                      <span>Blockchain-verified ownership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={20} />
                      <span>Artist royalties on resale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={20} />
                      <span>Provable scarcity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={20} />
                      <span>Global marketplace access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 mt-1" size={20} />
                      <span>Transparent transaction history</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-600 mb-4">Regular Digital Art</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="text-gray-400 mt-1">✕</div>
                      <span>No ownership verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="text-gray-400 mt-1">✕</div>
                      <span>No resale royalties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="text-gray-400 mt-1">✕</div>
                      <span>Infinitely copyable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="text-gray-400 mt-1">✕</div>
                      <span>Limited market access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="text-gray-400 mt-1">✕</div>
                      <span>No provenance tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples Section */}
        {activeTab === 'examples' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Featured NFT <span className="text-red-600">Artworks</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftExamples.map((nft) => (
                <div key={nft.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="relative">
                    <img 
                      src={nft.image} 
                      alt={nft.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs">
                      {nft.category}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{nft.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">by {nft.artist}</p>
                    <div className="text-xs text-gray-700 space-y-1 mb-3">
                      <div><span className="font-semibold">Owner:</span> {nft.owner}</div>
                      <div><span className="font-semibold">Bought:</span> {nft.bought}</div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{nft.note}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">{nft.price}</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye size={16} />
                        <span className="text-sm">{nft.likes}</span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {activeTab === 'benefits' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Benefits of <span className="text-red-600">NFT Art</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                    <benefit.icon className="text-red-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>


          </div>
        )}

        {/* How It Works Section */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              How NFTs <span className="text-red-600">Work</span>
            </h2>
            
            <div className="space-y-8">
              {howItWorks.map((step) => (
                <div key={step.step} className="flex gap-8 items-center">
                  <div className="flex-shrink-0 w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                  {step.step < 4 && (
                    <ChevronRight className="text-red-400" size={32} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">The Technology Behind NFTs</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <Zap className="text-red-600 mb-3" size={24} />
                  <h4 className="font-semibold mb-2">Smart Contracts</h4>
                  <p className="text-gray-600 text-sm">Self-executing contracts that automate ownership transfers and royalty payments</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <Globe className="text-red-600 mb-3" size={24} />
                  <h4 className="font-semibold mb-2">Blockchain</h4>
                  <p className="text-gray-600 text-sm">Distributed ledger that records all transactions permanently and transparently</p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <ShoppingCart className="text-red-600 mb-3" size={24} />
                  <h4 className="font-semibold mb-2">Digital Wallets</h4>
                  <p className="text-gray-600 text-sm">Secure digital wallets that store your NFTs and cryptocurrency</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Section */}
        {activeTab === 'faqs' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>


          </div>
        )}
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default NFTPage;
