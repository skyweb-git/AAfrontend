import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { productsAPI } from '../services/api';

const Shop = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getProducts({ page: 1, limit: 12 });
        if (!cancelled) setProducts(res.products || []);
      } catch (e) {
        if (!cancelled) setProducts([]);
        console.error('Shop products error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-black mb-2">SHOWCASE</h2>
            <p className="text-gray-600">Posted artworks from artists</p>
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span className="font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const imageUrl = product?.images?.[0]?.url;
              return (
                <div key={product._id} className="group cursor-pointer">
              {/* Product Image */}
              <div
                className="relative overflow-hidden rounded-lg mb-4 bg-gray-100"
                onClick={() => setPreviewItem(product)}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full">
                    {String(product.category || '').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black group-hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Art by {product?.artistProfile?.name || product?.artist?.displayName || 'Unknown Artist'}
                </p>
                
              </div>
            </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/art')}
            className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View More Art
          </button>
        </div>
      </div>

      {/* Showcase Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPreviewItem(null)} />
          <div className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-gray-900 truncate pr-4">{previewItem.name}</div>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="bg-black">
              <img
                src={previewItem?.images?.[0]?.url}
                alt={previewItem?.name}
                className="w-full max-h-[75vh] object-contain"
              />
            </div>
            <div className="p-4 text-sm text-gray-700">
              {previewItem.description}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Shop;
