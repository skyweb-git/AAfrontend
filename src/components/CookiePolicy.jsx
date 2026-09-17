import React, { useEffect } from 'react';

const CookiePolicy = () => {
  useEffect(() => {
    document.title = 'Cookie Policy - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'art artist Cookie Policy - How we use cookies and similar technologies to enhance your experience.';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl md:text-2xl mb-8">How We Use Cookies</p>
          <p className="text-lg max-w-3xl mx-auto">Last updated: May 12, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">What Are Cookies?</h2>
            <p className="text-gray-300 mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember information about your visit and make your experience more efficient and enjoyable.
            </p>
            <p className="text-gray-300">
              At art artist, we use cookies and similar technologies to enhance your experience, analyze site usage, and provide personalized content.
            </p>
          </section>

          {/* Types of Cookies We Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Essential Cookies</h3>
                <p className="text-gray-300 mb-3">These cookies are necessary for the website to function properly and cannot be disabled.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>User authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Shopping cart functionality</li>
                  <li>Load balancing</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Performance Cookies</h3>
                <p className="text-gray-300 mb-3">These cookies help us understand how visitors interact with our website.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Website traffic analysis</li>
                  <li>Page loading performance</li>
                  <li>Error tracking and debugging</li>
                  <li>User behavior patterns</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Functional Cookies</h3>
                <p className="text-gray-300 mb-3">These cookies enhance functionality and personalize your experience.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Remembering your preferences</li>
                  <li>Language and region settings</li>
                  <li>Customized content display</li>
                  <li>Artwork viewing preferences</li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Marketing Cookies</h3>
                <p className="text-gray-300 mb-3">These cookies are used to deliver relevant advertisements and content.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Personalized advertisements</li>
                  <li>Social media integration</li>
                  <li>Campaign tracking</li>
                  <li>Cross-site behavioral tracking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">How We Use Cookies</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Website Functionality</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Keep you logged in to your account</li>
                  <li>Remember your artwork preferences</li>
                  <li>Save items in your shopping cart</li>
                  <li>Provide personalized recommendations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Analytics & Improvement</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Analyze website traffic and usage</li>
                  <li>Identify popular content and features</li>
                  <li>Optimize website performance</li>
                  <li>Develop new features based on usage</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-300 mb-4">
              We use third-party services that may place cookies on your device:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Google Analytics</h4>
                <p className="text-gray-300">Helps us understand how visitors use our website and improve our services.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Social Media Platforms</h4>
                <p className="text-gray-300">Enable sharing and social media integration features.</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Payment Processors</h4>
                <p className="text-gray-300">Secure payment processing for memberships and purchases.</p>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">Browser Settings</h3>
            <p className="text-gray-300 mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>Accept or reject all cookies</li>
              <li>Delete existing cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Set preferences for different types of cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Cookie Consent Banner</h3>
            <p className="text-gray-300 mb-4">
              When you first visit our website, you'll see a cookie consent banner where you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Change preferences at any time</li>
            </ul>
          </section>

          {/* Cookie Duration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Cookie Duration</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-800 rounded-lg p-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">Session Cookies</h4>
                  <p className="text-gray-300">Deleted when you close your browser</p>
                </div>
                <span className="text-red-400 font-semibold">Temporary</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 rounded-lg p-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">Persistent Cookies</h4>
                  <p className="text-gray-300">Remain on your device for a set period</p>
                </div>
                <span className="text-red-400 font-semibold">30 days - 1 year</span>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Your Rights Regarding Cookies</h2>
            <p className="text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Accept or reject cookies</li>
              <li>Withdraw consent at any time</li>
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies from your device</li>
              <li>Opt out of targeted advertising</li>
            </ul>
          </section>

          {/* Impact of Disabling Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Impact of Disabling Cookies</h2>
            <p className="text-gray-300 mb-4">
              If you choose to disable cookies, some features of our website may not function properly:
            </p>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">What May Be Affected:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>User authentication and login functionality</li>
                <li>Shopping cart and payment processing</li>
                <li>Personalized content and recommendations</li>
                <li>Remembering your preferences</li>
                <li>Website analytics and performance monitoring</li>
              </ul>
            </div>
          </section>

          {/* Updates to Cookie Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Updates to This Policy</h2>
            <p className="text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the updated policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 mb-2">
                <strong>Email:</strong> privacy@artartist.in
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Phone:</strong> +91 73865 60012
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Address:</strong> 501 Nileema Greens, Miyapur, Rangareddy, Telangana, PIN: 500049
              </p>
              <p className="text-gray-300">
                <strong>Merchant Legal Entity:</strong> UDAY KUMAR SANGISETTI
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center text-gray-400 text-sm pt-6 border-t border-gray-700">
            <p>This Cookie Policy was last updated on May 12, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
