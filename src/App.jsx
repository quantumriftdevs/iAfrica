import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Truck, Sprout, Users, Phone, Mail, MapPin, Star, ShoppingCart, Eye, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

// Router simulation for SPA
const useRouter = () => {
  const [currentPath, setCurrentPath] = useState('/');
  
  const navigate = (path) => {
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };
  
  return { currentPath, navigate };
};

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


// Main App Component
const App = () => {
  const { currentPath, navigate } = useRouter();
  
  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/security':
        return <SecurityPage navigate={navigate} />;
      case '/agribusiness':
        return <AgribusinessPage navigate={navigate} />;
      case '/automotive':
        return <AutomotivePage navigate={navigate} />;
      case '/marketplace':
        return <MarketplacePage navigate={navigate} />;
      case '/team':
        return <TeamPage navigate={navigate} />;
      case '/investment':
        return <InvestmentPage navigate={navigate} />;
      case '/contact':
        return <ContactPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header currentPath={currentPath} navigate={navigate} />
      <main>
        {renderPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
};

// Header Component
const Header = ({ currentPath, navigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cossy White Limited</h1>
              <p className="text-sm text-emerald-600">Innovating Excellence</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`font-medium transition-colors duration-200 ${
                  currentPath === item.path
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {item.name}
              </button>
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
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left py-2 px-4 rounded-md transition-colors ${
                    currentPath === item.path
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Footer Component
const Footer = ({ navigate }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CW</span>
              </div>
              <span className="text-xl font-bold">Cossy White</span>
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
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Divisions</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/security')} className="text-gray-400 hover:text-emerald-500 transition-colors">Security Technologies</button></li>
              <li><button onClick={() => navigate('/agribusiness')} className="text-gray-400 hover:text-emerald-500 transition-colors">Agribusiness Export</button></li>
              <li><button onClick={() => navigate('/automotive')} className="text-gray-400 hover:text-emerald-500 transition-colors">Automotive Imports</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/marketplace')} className="text-gray-400 hover:text-emerald-500 transition-colors">Marketplace</button></li>
              <li><button onClick={() => navigate('/investment')} className="text-gray-400 hover:text-emerald-500 transition-colors">Investment Opportunities</button></li>
              <li><button onClick={() => navigate('/team')} className="text-gray-400 hover:text-emerald-500 transition-colors">Our Team</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/about')} className="text-gray-400 hover:text-emerald-500 transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-emerald-500 transition-colors">Contact</button></li>
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

export default App
