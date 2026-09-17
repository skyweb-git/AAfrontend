import React, { useEffect, useState } from 'react';

const Terms = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    message: ''
  });

  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = 'Terms & Conditions - ArtArtist.in';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Discover the essential terms and conditions crafted by Uday Kumar Sangisetti for artists and their art.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add email sending logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Art Terms & Conditions</h1>
          <p className="text-xl md:text-2xl mb-8">Discover the essential terms and conditions crafted by Uday Kumar Sangisetti for artists and their art.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Terms Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-red-400 mb-4">About Our Terms</h2>
                <h3 className="text-3xl font-bold mb-4">Terms and Conditions</h3>
                <p className="text-gray-400 mb-6">Effective Date: Last updated on 127-05-2025 15:43:14</p>
                <p className="mb-6">Welcome to ArtArtist.in. By accessing or using our website and participating in our community, you agree to the following terms and conditions:</p>
              </div>

              <div className="space-y-6">
                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">1. Eligibility</h4>
                  <p className="mb-2">Anyone who creates or appreciates art is welcome to join.</p>
                  <p>Users must be at least 18 years old or have parental/guardian consent to use the platform.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">2. Membership</h4>
                  <p className="mb-2">Lifetime membership is offered through a one-time payment.</p>
                  <p className="mb-3">Members are eligible for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Priority access to stalls at ArtArtist events</li>
                    <li>Feature in ArtArtist Magazine</li>
                    <li>Discounts with our partner brands/stores</li>
                    <li>Early information about upcoming markets and platforms</li>
                  </ul>
                  <p className="mt-3">Membership benefits are non-transferable.</p>
                  <p>Refunds for membership fees are not provided once the payment is made.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">3. Stall Booking</h4>
                  <p className="mb-2">Stall slots are booked on a first-come, first-served basis.</p>
                  <p className="mb-2">Advance bookings for upcoming events (Season 4 and 5) are open to all artists.</p>
                  <p className="mb-2">Stall booking confirmation is subject to full payment and submission of required information.</p>
                  <p>Once confirmed, stall bookings are non-refundable and non-transferable.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">4. Use of Content</h4>
                  <p className="mb-2">Artists grant ArtArtist.in permission to share their artwork (with credit) for promotional purposes on social media, website, and print material like magazines and posters.</p>
                  <p>Artists retain full rights to their original artworks.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">5. Code of Conduct</h4>
                  <p className="mb-2">Artists must respect fellow artists, organizers, and visitors.</p>
                  <p className="mb-2">Any form of hate speech, plagiarism, or abusive behavior will lead to suspension or ban.</p>
                  <p>Comparison or competition with fellow artists is discouraged. Art is about expression, not comparison.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">6. Event Conduct</h4>
                  <p className="mb-2">ArtArtist reserves the right to curate events and make final decisions regarding artist selections, stall locations, and collaborations.</p>
                  <p className="mb-2">Artists must adhere to event timings and setup protocols.</p>
                  <p>Artists must maintain their space and clean up post-event.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">7. Liability</h4>
                  <p className="mb-2">ArtArtist.in is not responsible for any loss, damage, or theft of artworks or personal belongings during events.</p>
                  <p>Participation in events is at the artist's own risk.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">8. Collaboration & Sponsorship</h4>
                  <p className="mb-2">Discounts and offers from collaborators are subject to availability and may vary.</p>
                  <p>ArtArtist.in is not responsible for the quality or delivery of third-party services.</p>
                </section>

                <section className="border-b border-gray-700 pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">9. Website Usage</h4>
                  <p className="mb-2">Users must not post harmful, illegal, or misleading content.</p>
                  <p>Users agree not to copy, scrape, or misuse any part of the site or member database.</p>
                </section>

                <section className="pb-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-3">10. Changes to Terms</h4>
                  <p>ArtArtist.in reserves the right to update these terms at any time. Continued use of the platform after changes implies acceptance of the updated terms.</p>
                </section>
              </div>

              <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                <p className="text-sm mb-2">For questions, reach out at:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <p className="flex items-center gap-2">
                    <span>?</span>
                    <a href="mailto:artartistofficial@gmail.com" className="text-red-400 hover:underline">artartistofficial@gmail.com</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>?</span>
                    <a href="tel:+917386560012" className="text-red-400 hover:underline">+91 73865 60012</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-red-400 mb-4">Contact Uday Kumar Sangisetti</h3>
              <p className="text-gray-400 mb-6">You may contact us using the information below:</p>
              
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Merchant Legal entity name:</p>
                <p className="font-semibold">UDAY KUMAR SANGISETTI</p>
                
                <p className="text-sm text-gray-400 mt-3 mb-1">Registered Address:</p>
                <p className="text-sm">501 nileema greens, miyapur, rangareddy, Telangana, PIN: 500049</p>
                
                <p className="text-sm text-gray-400 mt-3 mb-1">Operational Address:</p>
                <p className="text-sm">501 nileema greens, miyapur, rangareddy, Telangana, PIN: 500049</p>
                
                <p className="text-sm text-gray-400 mt-3 mb-1">Telephone No:</p>
                <p className="text-sm">7386560012</p>
                
                <p className="text-sm text-gray-400 mt-3 mb-1">E-Mail ID:</p>
                <p className="text-sm">artartistofficial@gmail.com</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Email Address*</label>
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
                  <label className="block text-sm font-medium mb-2">Your Message*</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your message here"
                    rows="4"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Submit Your Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
