import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="iAfrica logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold">iAfrica Education</span>
            </div>
            <p className="text-gray-400 mb-4">Empowering learners with quality education, expert instruction, and career-ready skills.</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-emerald-500" />
                <span className="text-sm">Amina B Zakari, Yahaya Gwagwa Close, House 2 Plot 6a 46 Crescent Gwarimpa, Abuja, Nigeria</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-emerald-500" />
                <span className="text-sm">+234 911 502 8534</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-emerald-500" />
                <span className="text-sm">info@iafricatrade.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={24} className="text-white hover:text-emerald-500 transition-colors" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={24} className="text-white hover:text-emerald-500 transition-colors" />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={24} className="text-white hover:text-emerald-500 transition-colors" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={24} className="text-white hover:text-emerald-500 transition-colors" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Learning</h3>
            <ul className="space-y-2">
              <li><Link to="/Programs" className="text-gray-400 hover:text-emerald-500 transition-colors">Programs</Link></li>
              <li><Link to="/Courses" className="text-gray-400 hover:text-emerald-500 transition-colors">Courses</Link></li>
              <li><Link to="/Lecturers" className="text-gray-400 hover:text-emerald-500 transition-colors">Lecturers</Link></li>
              <li><Link to="/Certificates" className="text-gray-400 hover:text-emerald-500 transition-colors">Certificates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Student Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/Enroll" className="text-gray-400 hover:text-emerald-500 transition-colors">Enrollment</Link></li>
              <li><Link to="/Resources" className="text-gray-400 hover:text-emerald-500 transition-colors">Learning Materials</Link></li>
              <li><Link to="/Enroll" className="text-gray-400 hover:text-emerald-500 transition-colors">Live Classes</Link></li>
              <li><Link to="/Enroll" className="text-gray-400 hover:text-emerald-500 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/Login" className="text-gray-400 hover:text-emerald-500 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-emerald-500 transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-emerald-500 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 iAfrica.com Educational Section - All Rights Reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Powered by LiveKit | Secured by Paystack</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
