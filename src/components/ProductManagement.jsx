import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, DollarSign, Image as ImageIcon, Save, X, Link, Search, RefreshCw, ShieldAlert } from 'lucide-react';
import Navbar from './Navbar';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Painting',
  inventory: 1,
  paymentLink: '',
  status: 'available',
  artistName: '',
};

const categories = ['Painting', 'Digital Art', 'Sculpture', 'Photography', 'Print', 'Supplies', 'Other'];

const ProductManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Admin-only gate
  const isAdmin = user?.role === 'admin';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsAPI.getProducts({ search: search || undefined, status: filterStatus || 'all', category: filterCategory || undefined, limit: 100 });
      setProducts(res.products || []);
    } catch (e) {
      setError('Failed to load products. Check your connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Painting',
      inventory: product.inventory || 1,
      paymentLink: product.paymentLink || '',
      status: product.status || 'available',
      artistName: product.artistName || product?.artistProfile?.name || '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) return setError('Product name is required.');
    if (!formData.price || Number(formData.price) <= 0) return setError('A valid price is required.');
    if (!formData.description.trim()) return setError('Description is required.');
    if (formData.paymentLink && !/^https?:\/\/.+/.test(formData.paymentLink.trim())) {
      return setError('Payment link must be a valid URL starting with http:// or https://');
    }

    setSaving(true);
    try {
      // Map category to server enum format
      const categoryMap = {
        'Painting': 'painting',
        'Digital Art': 'digital-art',
        'Sculpture': 'sculpture',
        'Photography': 'photography',
        'Print': 'print',
        'Supplies': 'supplies',
        'Other': 'other',
      };

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: categoryMap[formData.category] || formData.category.toLowerCase(),
        inventory: { quantity: Number(formData.inventory) || 1, trackQuantity: true },
        paymentLink: formData.paymentLink.trim(),
        status: formData.status,
        artistName: formData.artistName.trim(),
      };

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct._id, payload, imageFiles.length ? imageFiles : undefined);
        setSuccess('Product updated successfully!');
      } else {
        await productsAPI.createProduct(payload, imageFiles.length ? imageFiles : undefined);
        setSuccess('Product added successfully!');
      }
      closeForm();
      fetchProducts();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to save product.';
      setError(msg);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.deleteProduct(productId);
      setSuccess('Product deleted.');
      fetchProducts();
    } catch (e) {
      setError('Failed to delete product.');
    }
  };

  // If not admin, show access denied
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <ShieldAlert size={64} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Only</h2>
          <p className="text-gray-600 mb-6">Only administrators can manage products.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <ShieldAlert size={64} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in as admin to manage products.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage artwork, pricing, inventory and payment links</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X size={16} /></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Products count */}
        <p className="text-sm text-gray-500 mb-4">{products.length} product{products.length !== 1 ? 's' : ''}</p>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size={120} />
          </div>
        ) : products.length === 0 ? (

          <div className="text-center py-16 bg-white rounded-lg border">
            <Package size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-1">No Products Found</h3>
            <p className="text-gray-500 mb-6">Start by adding your first artwork.</p>
            <button
              onClick={openAddForm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={18} className="inline mr-2" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(product => {
              const imageUrl = product?.images?.[0]?.url;
              const artistDisplay = product?.artistProfile?.name || product?.artist?.displayName || product?.artistName || '—';
              return (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                      product.status === 'sold' ? 'bg-red-100 text-red-700' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.status || 'available'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-1 line-clamp-2">{product.description}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      <span className="font-medium text-gray-600">{product.category}</span>
                      {' · '}{artistDisplay}
                    </p>
                    <p className="text-red-600 font-bold text-lg mb-1">
                      {product.price ? `₹${product.price}` : 'Contact'}
                    </p>

                    {/* Payment Link */}
                    {product.paymentLink ? (
                      <a
                        href={product.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3 truncate"
                      >
                        <Link size={12} /> Payment Link
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 mb-3 italic">No payment link set</p>
                    )}

                    <p className="text-xs text-gray-400 mb-3">
                      Listed {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => openEditForm(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="absolute inset-0" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              {/* Name + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Mountain Sunset Oil Painting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Artist Name + Inventory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      name="inventory"
                      value={formData.inventory}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Link <span className="text-gray-400 font-normal">(Razorpay / UPI / any checkout URL)</span>
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="url"
                    name="paymentLink"
                    value={formData.paymentLink}
                    onChange={handleInputChange}
                    placeholder="https://rzp.io/l/yourlink or https://..."
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">This link will be shown to buyers when they click "Buy Now".</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  placeholder="Describe the artwork: medium, size, theme..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="img-upload"
                  />
                  <label htmlFor="img-upload" className="flex flex-col items-center cursor-pointer">
                    <ImageIcon size={36} className="text-gray-300 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload images</span>
                    <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editingProduct?.images?.length > 0 && imagePreviews.length === 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Current images will be kept unless you upload new ones.
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-60"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
