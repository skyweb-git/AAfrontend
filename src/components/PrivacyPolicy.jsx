import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'art artist Privacy Policy - How we collect, use, and protect your personal information.';
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl md:text-2xl mb-8">Your Privacy Matters to Us</p>
          <p className="text-lg max-w-3xl mx-auto">Last updated: May 12, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Introduction</h2>
            <p className="text-gray-300 mb-4">
              At art artist, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect your information when you use our website, services, and participate in our art community.
            </p>
            <p className="text-gray-300">
              By using art artist, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Name, email address, phone number</li>
              <li>Postal address and location information</li>
              <li>Payment information (processed securely)</li>
              <li>Art portfolio and artwork details</li>
              <li>Professional background and experience</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Technical Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage patterns and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Art-Related Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Artwork images and descriptions</li>
              <li>Artist statements and biographies</li>
              <li>Event participation and workshop attendance</li>
              <li>Studio bookings and preferences</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>To provide and maintain our services</li>
              <li>To process transactions and manage memberships</li>
              <li>To communicate with you about events and opportunities</li>
              <li>To personalize your experience on our platform</li>
              <li>To showcase your artwork with proper attribution</li>
              <li>To facilitate connections within the art community</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure platform security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Information Sharing</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">We Do Not Sell Your Information</h3>
            <p className="text-gray-300 mb-4">
              We never sell your personal information to third parties. We only share information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">When We Share Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
              <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate our platform</li>
              <li><strong>Art Community:</strong> Your public profile and artwork are visible to other community members</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sales of business assets</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Public Information</h3>
            <p className="text-gray-300">
              Information you choose to make public, such as your artist profile, artwork, and participation in events, will be visible to other users and the general public.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and database protection</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication systems</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-300 mt-4">
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to certain uses of your information</li>
              <li><strong>Restriction:</strong> Limit how we use your information</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise these rights, please contact us at privacy@artartist.in
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand site usage</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              <li><strong>Marketing Cookies:</strong> Show relevant content and advertisements</li>
            </ul>
            <p className="text-gray-300 mt-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Children's Privacy</h2>
            <p className="text-gray-300 mb-4">
              Our services are not intended for children under 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information immediately.
            </p>
            <p className="text-gray-300">
              Users under 18 must have parental or guardian consent to use our platform.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">International Data Transfers</h2>
            <p className="text-gray-300">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or how we handle your information, please contact us:
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
            <p>This Privacy Policy was last updated on May 12, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
