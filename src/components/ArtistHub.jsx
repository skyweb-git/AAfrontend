import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Phone, Mail, Camera, CreditCard, Shield, Check } from 'lucide-react';
import axios from 'axios';

const ArtistHub = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    instagram: '',
    facebook: '',
    aadharNumber: '',
    aadharName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.artistName.trim()) {
      newErrors.artistName = 'Artist name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits starting with 6-9';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }
    
    if (!formData.aadharName.trim()) {
      newErrors.aadharName = 'Name as per Aadhar is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sverxiioo.nanoprofiles.com/api';
      
      // 1. Create order session in backend
      const response = await axios.post(`${API_BASE_URL}/payments/create-membership-session`, {
        name: formData.artistName,
        email: formData.email,
        phone: formData.mobile,
        artForm: 'Visual Artist',
        bio: `Aadhar Name: ${formData.aadharName}. City: ${formData.city}`
      });

      if (response.data && response.data.paymentSessionId) {
        const { paymentSessionId, environment } = response.data;
        
        // 2. Initialize Cashfree SDK
        if (typeof window.Cashfree === 'undefined') {
          alert('Cashfree SDK is loading, please try again in a moment.');
          setIsSubmitting(false);
          return;
        }

        const cashfree = window.Cashfree({
          mode: environment === 'PRODUCTION' ? 'production' : 'sandbox'
        });

        // 3. Open Checkout
        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          returnUrl: `${window.location.origin}/artist/login?order_id={order_id}`
        });
      } else {
        alert('Failed to initialize payment session. Please try again.');
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Join <span className="text-red-600">Artist</span> Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Become a verified artist and unlock premium features
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Verified Profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-4 h-4" />
              <span>0% Commission</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>Premium Leads</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Artist Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                    errors.artistName ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Enter your artist name"
                />
              </div>
              {errors.artistName && (
                <p className="mt-1 text-sm text-red-600">{errors.artistName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                    errors.email ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                    errors.mobile ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artists Address <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors resize-none ${
                    errors.address ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                    errors.city ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  placeholder="@yourusername"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  placeholder="your-facebook-profile"
                />
              </div>
            </div>

            {/* Aadhar Card Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Aadhar Card Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    maxLength="12"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                      errors.aadharNumber ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012"
                  />
                  {errors.aadharNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name as per Aadhar <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadharName"
                    value={formData.aadharName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors ${
                      errors.aadharName ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="Name as on Aadhar card"
                  />
                  {errors.aadharName && (
                    <p className="mt-1 text-sm text-red-600">{errors.aadharName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Registration...</span>
                    <span className="text-sm">Redirecting to payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Complete Registration & Proceed to Payment</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Secure Payment Gateway</p>
                  <p>You will be redirected to Cashfree secure payment gateway to complete your Artist Hub membership registration.</p>
                  <p className="text-xs mt-2">Your Aadhar information is encrypted and securely processed.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistHub;
