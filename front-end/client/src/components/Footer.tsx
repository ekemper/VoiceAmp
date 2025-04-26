export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-teal/20">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold font-playfair mb-4">
              <span className="text-white">Voice</span>
              <span className="text-teal">Amp</span>
            </div>
            <p className="text-gray-custom mb-6 max-w-md">
              Amplifying voices. Streamlining grants. Making funding more accessible for mission-driven organizations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-custom hover:text-teal transition-colors" aria-label="Twitter">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-custom hover:text-teal transition-colors" aria-label="LinkedIn">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-custom hover:text-teal transition-colors" aria-label="Instagram">
                <i className="ri-instagram-line text-xl"></i>
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-teal">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-custom hover:text-teal transition-colors">About Us</a></li>
                <li><a href="#demo" className="text-gray-custom hover:text-teal transition-colors">Try Demo</a></li>
                <li><a href="#" className="text-gray-custom hover:text-teal transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-custom mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VoiceAmp. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-custom hover:text-teal transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-custom hover:text-teal transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
