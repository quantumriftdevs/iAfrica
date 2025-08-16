import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Truck, Sprout, Users, Phone, Mail, MapPin, Star, ShoppingCart, Eye, ArrowRight, Menu, X, ChevronDown, Facebook, Instagram } from 'lucide-react';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import SecurityPage from './Pages/SecurityPage';
import AgribusinessPage from './Pages/AgribusinessPage';
import AutomotivePage from './Pages/AutomotivePage';
import MarketplacePage from './Pages/MarketPlace';
import TeamPage from './Pages/TeamPage';
import InvestmentPage from './Pages/Investmentpage';
import PrivacyPage from './Pages/PrivacyPage';
import TermsPage from './Pages/TermsPage';
import ContactPage from './Pages/ContactPage';
import NotFoundPage from './Pages/404';

// Animation hooks
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return [ref, isVisible];
};

// Wrapper component to pass navigate function to pages
const PageWrapper = ({ children }) => {
  const navigate = useNavigate();
  
  return React.cloneElement(children, { navigate });
};

// Main App Component with Router
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
            <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
            <Route path="/agribusiness" element={<PageWrapper><AgribusinessPage /></PageWrapper>} />
            <Route path="/automotive" element={<PageWrapper><AutomotivePage /></PageWrapper>} />
            <Route path="/marketplace" element={<PageWrapper><MarketplacePage /></PageWrapper>} />
            <Route path="/team" element={<PageWrapper><TeamPage /></PageWrapper>} />
            <Route path="/investment" element={<PageWrapper><InvestmentPage /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

// Header Component with React Router
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Security', path: '/security' },
    { name: 'Agribusiness', path: '/agribusiness' },
    { name: 'Automotive', path: '/automotive' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Team', path: '/team' },
    { name: 'Investment', path: '/investment' },
    { name: 'Contact', path: '/contact' }
  ];
  
  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/apple-touch-icon.png"
              alt="Cossy White Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cossy White Limited</h1>
              <p className="text-sm text-emerald-600">Innovating Excellence</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left py-2 px-4 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Footer Component with React Router
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <img
                  src="/apple-touch-icon.png"
                  alt="Cossy White Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>
              <span className="text-xl font-bold">Cossy White Limited</span>
            </div>
            <p className="text-gray-400 mb-4">Innovating Security. Connecting Markets. Driving Excellence.</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-emerald-500" />
                <span className="text-sm">4 BDT 25, Canaan Estate, Life Camp, Abuja</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-emerald-500" />
                <span className="text-sm">+234 803 493 1164</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-emerald-500" />
                <span className="text-sm">info@cossywhite.com</span>
              </div>
            </div>
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4 mt-6">
              <a href="https://www.facebook.com/share/1CESLD3CVY/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={28} className="text-white hover:opacity-80 transition-opacity" />
              </a>
              <a href="https://www.instagram.com/cossywhitelimited1?igsh=bmhkcWpya3U2eHFk" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={28} className="text-white hover:opacity-80 transition-opacity" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Divisions</h3>
            <ul className="space-y-2">
              <li><Link to="/security" className="text-gray-400 hover:text-emerald-500 transition-colors">Security Technologies</Link></li>
              <li><Link to="/agribusiness" className="text-gray-400 hover:text-emerald-500 transition-colors">Agribusiness Export</Link></li>
              <li><Link to="/automotive" className="text-gray-400 hover:text-emerald-500 transition-colors">Automotive Imports</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="text-gray-400 hover:text-emerald-500 transition-colors">Marketplace</Link></li>
              <li><Link to="/investment" className="text-gray-400 hover:text-emerald-500 transition-colors">Investment Opportunities</Link></li>
              <li><Link to="/team" className="text-gray-400 hover:text-emerald-500 transition-colors">Our Team</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-emerald-500 transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-emerald-500 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 Cossy White Limited - All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default App;