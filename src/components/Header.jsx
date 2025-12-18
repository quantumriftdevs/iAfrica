import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export const SiteLogo = ({ className = 'w-12 h-12' }) => (
  <div className={`rounded-lg flex items-center justify-center ${className}`}>
    <img src="/logo.png" alt="iAfrica logo" className="w-full h-full object-contain" />
  </div>
);

// Full brand (logo + title + subtitle) as a single Link component
export const SiteBrand = ({ className = 'flex items-center space-x-3' }) => (
  <Link to="/" className={className}>
    <SiteLogo />
  </Link>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/Courses' },
    // { name: 'Lecturers', path: '/Lecturers' },
    { name: 'Enroll', path: '/Enroll' },
    { name: 'Resources', path: '/Resources' },
    { name: 'Certificates', path: '/Certificates' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <SiteBrand />

          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`font-medium transition-colors duration-200 ${location.pathname === item.path ? 'text-emerald-600 border-b-2 border-emerald-600' : isScrolled ? 'text-gray-700 hover:text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side controls: login button (responsive) and mobile menu toggle */}
          <div className="flex items-center gap-3">
            {/* Login button for large screens (far right) */}
            <Link to="/Login" className="hidden lg:inline-flex px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg">
              Login
            </Link>

            {/* On small screens show a compact login button to the left of the menu icon */}
            <Link to="/Login" className="lg:hidden px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
              Login
            </Link>

            <button className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-1 pt-4 px-4 pb-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`text-left py-3 px-4 rounded-lg transition-colors font-medium ${location.pathname === item.path ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'}`}>
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

export default Header;
