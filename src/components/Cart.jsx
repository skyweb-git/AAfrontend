import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { couponsAPI } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, isOpen, toggleCart, removeFromCart, updateQuantity, clearCart } = useCart();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError('');
    setCouponSuccess('');
    setValidatingCoupon(true);

    try {
      const res = await couponsAPI.validateCoupon(couponInput.trim(), totalPrice, 'products');
      if (res && res.valid) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount: res.discount,
          discountType: res.coupon.discountType,
          discountAmount: res.coupon.discountAmount,
          finalAmount: res.finalAmount
        });
        setCouponSuccess(res.message || `Coupon ${res.coupon.code} applied!`);
        setCouponInput('');
      } else {
        setCouponError(res?.error || 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Coupon apply error:', err);
      const msg = err.response?.data?.error || 'Invalid or expired coupon code';
      setCouponError(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Calculations
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountedSubtotal = Math.max(0, totalPrice - discount);
  const tax = Math.round(discountedSubtotal * 0.18);
  const finalTotal = discountedSubtotal + tax;

  const handleCheckout = () => {
    // Proceed to checkout with discount applied
    alert(`Proceeding to checkout with total ₹${finalTotal.toLocaleString()}${appliedCoupon ? ` (${appliedCoupon.code} applied: -₹${discount})` : ''}...`);
    toggleCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleCart}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-red-600" />
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {totalItems}
            </span>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some products to get started!</p>
              <button
                onClick={() => {
                  toggleCart();
                  navigate('/art');
                }}
                className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-black">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-gray-50 flex-shrink-0">
            {/* Coupon Code Section */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-xs uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-xs text-emerald-700 ml-2 font-medium">
                        (-₹{discount.toLocaleString()} OFF)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter coupon code..."
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={13} /> {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                      <Check size={13} /> {couponSuccess}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={14} /> Coupon ({appliedCoupon.code})
                  </span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-red-600">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-md"
              >
                Checkout (₹{finalTotal.toLocaleString()})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
