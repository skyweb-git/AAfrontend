import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Package, Calendar, Settings, LogOut, Plus, Edit, Trash2, Search, ArrowLeft, MapPin, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import AddProductButton from './AddProductButton';
import Loader from './Loader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ArtDistrict states
  const [artDistrictPrices, setArtDistrictPrices] = useState({
    daily: '299',
    weekly: '999',
    monthly: '2499'
  });
  const [registrations, setRegistrations] = useState([]);
  const [artSearchTerm, setArtSearchTerm] = useState('');
  const [artFilterCategory, setArtFilterCategory] = useState('');
  const [artFilterPass, setArtFilterPass] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [manualMember, setManualMember] = useState({
    fullName: '',
    email: '',
    insta: '',
    category: '',
    passType: 'Sketch Pass (Daily)',
    paymentMethod: 'UPI'
  });
  const [artDistrictToast, setArtDistrictToast] = useState('');

  useEffect(() => {
    // Load ArtDistrict prices
    const savedPrices = localStorage.getItem('artdistrict_prices');
    if (savedPrices) {
      setArtDistrictPrices(JSON.parse(savedPrices));
    }

    // Load ArtDistrict registrations
    const savedRegs = localStorage.getItem('artdistrict_registrations');
    if (savedRegs) {
      setRegistrations(JSON.parse(savedRegs));
    } else {
      // Prepopulate mock registrations
      const mockRegs = [
        {
          fullName: "Ananya Reddy",
          email: "ananya@example.com",
          insta: "@ananya.art",
          category: "Painter",
          passType: "Sketch Pass (Daily)",
          price: "₹299",
          initials: "AR",
          memberId: "AA-2026-8812",
          validFrom: "21 May 2026",
          validThru: "22 May 2026",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          fullName: "Kabir Sen",
          email: "kabir.sen@example.com",
          insta: "@kabir.sculpts",
          category: "Sculptor",
          passType: "Studio Pass (Weekly)",
          price: "₹999",
          initials: "KS",
          memberId: "AA-2026-3024",
          validFrom: "18 May 2026",
          validThru: "25 May 2026",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          fullName: "Meera Nair",
          email: "meera@designhub.in",
          insta: "@meera.illustrates",
          category: "Digital Artist",
          passType: "Studio Pass (Monthly)",
          price: "₹2,499",
          initials: "MN",
          memberId: "AA-2026-1049",
          validFrom: "01 May 2026",
          validThru: "01 Jun 2026",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ];
      localStorage.setItem('artdistrict_registrations', JSON.stringify(mockRegs));
      setRegistrations(mockRegs);
    }
  }, [activeTab]);

  const showArtToast = (msg) => {
    setArtDistrictToast(msg);
    setTimeout(() => {
      setArtDistrictToast('');
    }, 4000);
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    localStorage.setItem('artdistrict_prices', JSON.stringify(artDistrictPrices));
    showArtToast('Pricing configuration updated successfully!');
  };

  const handleDeleteRegistration = (memberId) => {
    if (window.confirm(`Are you sure you want to cancel/delete member pass ${memberId}?`)) {
      const updated = registrations.filter(reg => reg.memberId !== memberId);
      localStorage.setItem('artdistrict_registrations', JSON.stringify(updated));
      setRegistrations(updated);
      showArtToast(`Pass ${memberId} has been deleted.`);
    }
  };

  const handleAddManualMember = (e) => {
    e.preventDefault();
    if (!manualMember.fullName.trim() || !manualMember.email.trim() || !manualMember.insta.trim() || !manualMember.category) {
      alert('Please fill out all required fields.');
      return;
    }

    // Calculate dates
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const validFrom = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    
    const expiry = new Date();
    if (manualMember.passType.toLowerCase().includes('daily')) {
      expiry.setDate(today.getDate() + 1);
    } else if (manualMember.passType.toLowerCase().includes('weekly')) {
      expiry.setDate(today.getDate() + 7);
    } else {
      expiry.setDate(today.getDate() + 30);
    }
    const validThru = `${expiry.getDate()} ${months[expiry.getMonth()]} ${expiry.getFullYear()}`;

    // User initials
    const names = manualMember.fullName.trim().split(' ');
    const initials = names.length > 1 
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : names[0].substring(0, 2).toUpperCase();

    // Unique Member ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const memberId = `AA-2026-${randomId}`;

    // QR Code
    const qrData = encodeURIComponent(`ID:${memberId}|Name:${manualMember.fullName}|Pass:${manualMember.passType}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    // Price mapping
    let price = '₹299';
    if (manualMember.passType.toLowerCase().includes('daily')) {
      price = `₹${artDistrictPrices.daily}`;
    } else if (manualMember.passType.toLowerCase().includes('weekly')) {
      price = `₹${artDistrictPrices.weekly}`;
    } else {
      price = `₹${artDistrictPrices.monthly}`;
    }

    const newReg = {
      fullName: manualMember.fullName,
      email: manualMember.email,
      insta: manualMember.insta.startsWith('@') ? manualMember.insta : `@${manualMember.insta}`,
      category: manualMember.category,
      passType: manualMember.passType,
      price,
      initials,
      memberId,
      validFrom,
      validThru,
      qrCodeUrl: qrUrl,
      createdAt: new Date().toISOString()
    };

    const updated = [newReg, ...registrations];
    localStorage.setItem('artdistrict_registrations', JSON.stringify(updated));
    setRegistrations(updated);
    
    // Reset form
    setManualMember({
      fullName: '',
      email: '',
      insta: '',
      category: '',
      passType: 'Sketch Pass (Daily)',
      paymentMethod: 'UPI'
    });
    setShowAddMemberModal(false);
    showArtToast(`Walk-in pass ${memberId} created successfully!`);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const searchString = `${reg.fullName} ${reg.email} ${reg.memberId}`.toLowerCase();
    const matchesSearch = searchString.includes(artSearchTerm.toLowerCase());
    const matchesCategory = artFilterCategory === '' || reg.category === artFilterCategory;
    const matchesPass = artFilterPass === '' || reg.passType.includes(artFilterPass);
    return matchesSearch && matchesCategory && matchesPass;
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.stats);
      setUsers(response.recentActivity.users);
      setProducts(response.recentActivity.products);
      setEvents(response.recentActivity.events);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ search: searchTerm, status: filterStatus });
      setUsers(response.users);
    } catch (error) {
      console.error('Users fetch error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts({ search: searchTerm, status: filterStatus });
      setProducts(response.products);
    } catch (error) {
      console.error('Products fetch error:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await adminAPI.getEvents({ search: searchTerm, status: filterStatus });
      setEvents(response.events);
    } catch (error) {
      console.error('Events fetch error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Delete product error:', error);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminAPI.deleteEvent(eventId);
        fetchEvents();
      } catch (error) {
        console.error('Delete event error:', error);
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader size={150} dark />
          <p className="mt-6 text-gray-400 font-medium">Loading admin dashboard...</p>
        </div>
      </div>

    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Back to Website"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Site</span>
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.displayName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="mt-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'dashboard' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                fetchUsers();
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'users' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <Users size={20} />
              Users
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                fetchProducts();
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'products' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <Package size={20} />
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab('events');
                fetchEvents();
              }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'events' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <Calendar size={20} />
              Events
            </button>
            <button
              onClick={() => setActiveTab('art-district')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'art-district' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <MapPin size={20} />
              ArtDistrict
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === 'settings' ? 'bg-red-50 text-red-600 border-r-2 border-red-600' : 'text-gray-700'
              }`}
            >
              <Settings size={20} />
              Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="blue" />
                <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={Package} color="green" />
                <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={Calendar} color="purple" />
                <StatCard title="Artists" value={stats?.totalArtists || 0} icon={Users} color="orange" />
                <StatCard title="Available Products" value={stats?.availableProducts || 0} icon={Package} color="teal" />
                <StatCard title="Upcoming Events" value={stats?.upcomingEvents || 0} icon={Calendar} color="pink" />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">${product.price}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {product.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">{new Date(event.date.start).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <AddProductButton />
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="artist">Artist</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'artist' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit size={16} />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <AddProductButton />
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Package size={48} className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-red-600">${product.price}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {product.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
                          <Edit size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                <button 
                  onClick={() => navigate('/event-management')}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <Plus size={20} />
                  Add Event
                </button>
              </div>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>📅 {new Date(event.date.start).toLocaleDateString()}</span>
                          <span>📍 {event.location.venue}</span>
                          <span>👥 {event.capacity.current}/{event.capacity.max}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {event.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'art-district' && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ArtDistrict Workspace Control</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage dynamic pass pricing, view checkouts, and issue manual registrations.</p>
                </div>
              </div>

              {/* Status Alert Toast inside view */}
              {artDistrictToast && (
                <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center gap-2 shadow-sm transition-all duration-300">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                  <span className="font-semibold text-sm">{artDistrictToast}</span>
                </div>
              )}

              {/* Grid 2-columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Column 1 & 2: Pricing configuration card */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Palette size={20} className="text-red-600" />
                    Configurable Entry Pass Fees (₹)
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">Set prices for the three entry passes on the landing page.</p>
                  
                  <form onSubmit={handleSavePrices} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Daily Sketch Pass</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={artDistrictPrices.daily}
                            onChange={(e) => setArtDistrictPrices({ ...artDistrictPrices, daily: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Weekly Studio Pass</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={artDistrictPrices.weekly}
                            onChange={(e) => setArtDistrictPrices({ ...artDistrictPrices, weekly: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Monthly Studio Pass</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={artDistrictPrices.monthly}
                            onChange={(e) => setArtDistrictPrices({ ...artDistrictPrices, monthly: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Save Price Settings
                    </button>
                  </form>
                </div>

                {/* Column 3: Live Overview Analytics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={20} className="text-red-600" />
                    Live Registry Overview
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">Total workspace entries & categories.</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm py-1 border-b">
                      <span className="text-gray-600 font-medium">Total Passes Active:</span>
                      <span className="font-bold text-gray-900">{registrations.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b">
                      <span className="text-gray-600">Painters / Fine Artists:</span>
                      <span className="font-semibold text-gray-800">{registrations.filter(r => r.category === 'Painter').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b">
                      <span className="text-gray-600">Sculptors:</span>
                      <span className="font-semibold text-gray-800">{registrations.filter(r => r.category === 'Sculptor').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b">
                      <span className="text-gray-600">Digital Artists:</span>
                      <span className="font-semibold text-gray-800">{registrations.filter(r => r.category === 'Digital Artist').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="text-gray-600">Other Creators:</span>
                      <span className="font-semibold text-gray-800">{registrations.filter(r => !['Painter', 'Sculptor', 'Digital Artist'].includes(r.category)).length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passes Registry Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Artist Pass Registry Log</h3>
                    <p className="text-gray-500 text-xs mt-1">Review active member checkouts or issue a manual walk-in pass.</p>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    Issue Walk-in Pass
                  </button>
                </div>

                {/* Registry Search / Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members by Name, Email, or Member ID..."
                      value={artSearchTerm}
                      onChange={(e) => setArtSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                  </div>
                  <select
                    value={artFilterCategory}
                    onChange={(e) => setArtFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="Painter">Painter / Fine Artist</option>
                    <option value="Sculptor">Sculptor</option>
                    <option value="Digital Artist">Digital Artist / Designer</option>
                    <option value="Writer">Writer / Poet</option>
                    <option value="Musician">Musician / Producer</option>
                    <option value="Photographer">Photographer / Filmmaker</option>
                    <option value="Other">Other Creative Idea</option>
                  </select>
                  <select
                    value={artFilterPass}
                    onChange={(e) => setArtFilterPass(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white"
                  >
                    <option value="">All Passes</option>
                    <option value="Daily">Daily Sketch Pass</option>
                    <option value="Weekly">Weekly Studio Pass</option>
                    <option value="Monthly">Monthly Studio Pass</option>
                  </select>
                </div>

                {/* Registry Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Artist / Member</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pass Type & Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Validity Period</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs">
                            No active registrations found matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr key={reg.memberId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                  {reg.initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-xs text-gray-900">{reg.fullName}</p>
                                  <p className="text-gray-500 text-[10px]">{reg.email}</p>
                                  <p className="text-red-500 text-[10px] mt-0.5">{reg.insta}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                              {reg.category}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                  reg.passType.includes('Daily') ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                  reg.passType.includes('Weekly') ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                  'bg-purple-50 text-purple-600 border border-purple-200'
                                }`}>
                                  {reg.passType}
                                </span>
                                <p className="text-xs font-bold text-gray-900 mt-1">{reg.price}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              <div>
                                <p className="text-[11px] font-medium text-gray-700">From: {reg.validFrom}</p>
                                <p className="text-[11px] font-medium text-gray-700 mt-0.5">Thru: {reg.validThru}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono font-bold text-gray-700">
                              {reg.memberId}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteRegistration(reg.memberId)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                                title="Cancel Membership"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal - manual add member */}
              {showAddMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                      <div>
                        <h3 className="font-bold text-base">Issue Walk-in Pass</h3>
                        <p className="text-xs text-red-100">Register new member directly from the desk.</p>
                      </div>
                      <button
                        onClick={() => setShowAddMemberModal(false)}
                        className="text-white hover:text-red-200 font-bold text-lg cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleAddManualMember} className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={manualMember.fullName}
                          onChange={(e) => setManualMember({ ...manualMember, fullName: e.target.value })}
                          placeholder="Ananya Reddy"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={manualMember.email}
                          onChange={(e) => setManualMember({ ...manualMember, email: e.target.value })}
                          placeholder="ananya@example.com"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram Handle *</label>
                        <input
                          type="text"
                          value={manualMember.insta}
                          onChange={(e) => setManualMember({ ...manualMember, insta: e.target.value })}
                          placeholder="@ananya.art"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                          <select
                            value={manualMember.category}
                            onChange={(e) => setManualMember({ ...manualMember, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white"
                            required
                          >
                            <option value="" disabled>Select</option>
                            <option value="Painter">Painter</option>
                            <option value="Sculptor">Sculptor</option>
                            <option value="Digital Artist">Digital Artist</option>
                            <option value="Writer">Writer</option>
                            <option value="Musician">Musician</option>
                            <option value="Photographer">Photographer</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Pass Type *</label>
                          <select
                            value={manualMember.passType}
                            onChange={(e) => setManualMember({ ...manualMember, passType: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white"
                            required
                          >
                            <option value="Sketch Pass (Daily)">Sketch Pass (Daily)</option>
                            <option value="Studio Pass (Weekly)">Studio Pass (Weekly)</option>
                            <option value="Studio Pass (Monthly)">Studio Pass (Monthly)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => setShowAddMemberModal(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Generate Member Pass
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      defaultValue="ArtArtist"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <textarea
                      rows={3}
                      defaultValue="A vibrant community for artists to showcase, connect, and grow"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="maintenance" className="rounded" />
                    <label htmlFor="maintenance" className="text-sm text-gray-700">Maintenance Mode</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="registrations" defaultChecked className="rounded" />
                    <label htmlFor="registrations" className="text-sm text-gray-700">Allow New Registrations</label>
                  </div>
                </div>
                
                <button className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
