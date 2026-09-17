import React, { useEffect } from 'react';

const Disclaimer = () => {
  useEffect(() => {
    document.title = 'Disclaimer - art artist';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'art artist Disclaimer - Important information about our services, limitations, and user responsibilities.';
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Disclaimer</h1>
          <p className="text-xl md:text-2xl mb-8">Important Information</p>
          <p className="text-lg max-w-3xl mx-auto">Last updated: May 12, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          
          {/* General Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">General Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The information provided on the art artist website and platform is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no warranties or representations of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the information contained on this website.
            </p>
            <p className="text-gray-300">
              Any reliance you place on such information is therefore strictly at your own risk.
            </p>
          </section>

          {/* Artwork and Artist Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Artwork and Artist Information</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Artwork Authenticity</h3>
                <p className="text-gray-300">
                  art artist serves as a platform connecting artists with art enthusiasts. While we verify artist identities to the best of our ability, we cannot guarantee the absolute authenticity of all artwork displayed on our platform. Buyers are encouraged to conduct their own due diligence before making purchases.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Artist Representations</h3>
                <p className="text-gray-300">
                  Artist profiles, biographies, and artwork descriptions are provided by the artists themselves. art artist is not responsible for the accuracy of these representations or any claims made by artists about their work, experience, or qualifications.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Pricing and Valuation</h3>
                <p className="text-gray-300">
                  Artwork prices are set by individual artists and do not necessarily reflect market value or investment potential. art artist does not provide art valuation services or investment advice.
                </p>
              </div>
            </div>
          </section>

          {/* Services and Events */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Services and Events</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Workshops and Training</h3>
                <p className="text-gray-300">
                  While we carefully select our instructors and workshop content, art artist cannot guarantee specific learning outcomes or skill development. Results may vary based on individual effort, talent, and participation.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Studio Rentals</h3>
                <p className="text-gray-300">
                  Studio facilities are provided "as-is." art artist is not responsible for the condition of equipment or facilities beyond what is explicitly stated in the rental agreement. Users should inspect facilities before booking.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Art Events and Exhibitions</h3>
                <p className="text-gray-300">
                  Event schedules, locations, and participants are subject to change. art artist reserves the right to modify or cancel events due to unforeseen circumstances. We are not liable for travel or accommodation expenses related to event changes.
                </p>
              </div>
            </div>
          </section>

          {/* Financial and Legal */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Financial and Legal Disclaimer</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Investment Advice</h3>
                <p className="text-gray-300">
                  art artist does not provide financial, investment, or legal advice. Any information about art market trends or artist potential should not be considered investment advice. Consult with qualified professionals before making financial decisions.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Payment Processing</h3>
                <p className="text-gray-300">
                  While we use secure payment processing systems, art artist is not liable for unauthorized transactions, payment failures, or issues related to third-party payment processors.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Refund Policy</h3>
                <p className="text-gray-300">
                  Refund policies vary by service and are clearly stated in our Terms & Conditions. Some services, such as membership fees and event bookings, may be non-refundable as specified.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Technical Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The art artist platform is provided "as-is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Uninterrupted or error-free operation</li>
              <li>Compatibility with all devices or browsers</li>
              <li>Protection against viruses or malware</li>
              <li>Data security or backup of user content</li>
              <li>Availability of specific features or content</li>
            </ul>
            <p className="text-gray-300">
              Users are responsible for maintaining backups of their important data and content.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Third-Party Links and Content</h2>
            <p className="text-gray-300 mb-4">
              Our website may contain links to third-party websites, services, or resources. These links are provided for convenience only. We have no control over the content, privacy policies, or practices of third-party sites and assume no responsibility for them.
            </p>
            <p className="text-gray-300">
              Inclusion of any links does not imply endorsement or recommendation of the third-party content.
            </p>
          </section>

          {/* User Responsibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">User Responsibility</h2>
            <p className="text-gray-300 mb-4">
              As a user of the art artist platform, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Verify information independently before making decisions</li>
              <li>Conduct due diligence before purchasing artwork</li>
              <li>Protect your account credentials and personal information</li>
              <li>Use the platform in accordance with our Terms & Conditions</li>
              <li>Accept responsibility for your actions and transactions</li>
            </ul>
            <p className="text-gray-300">
              Users are solely responsible for any content they post or share on the platform.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              To the fullest extent permitted by law, art artist and its founders, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Loss of profits or revenue</li>
              <li>Loss of data or information</li>
              <li>Damage to reputation</li>
              <li>Artwork damage or loss</li>
              <li>Business interruption</li>
            </ul>
            <p className="text-gray-300">
              Our total liability shall not exceed the amount paid by you for the specific service in question.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Indemnification</h2>
            <p className="text-gray-300">
              You agree to indemnify and hold art artist, its founders, employees, and affiliates harmless from any claims, damages, or expenses arising from your use of the platform, violation of these terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* Updates to Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Updates to This Disclaimer</h2>
            <p className="text-gray-300">
              We may update this disclaimer from time to time to reflect changes in our services or legal requirements. Continued use of our platform after any changes constitutes acceptance of the updated disclaimer.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this disclaimer, please contact us:
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 mb-2">
                <strong>Email:</strong> legal@artartist.in
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
            <p>This Disclaimer was last updated on May 12, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
