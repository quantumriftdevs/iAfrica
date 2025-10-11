import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export const SiteLogo = ({ className = 'w-12 h-12' }) => (
  <div className={`bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center ${className}`}>
    <GraduationCap className="text-white" size={28} />
  </div>
);

// Full brand (logo + title + subtitle) as a single Link component
export const SiteBrand = ({ className = 'flex items-center space-x-3' }) => (
  <Link to="/" className={className}>
    <SiteLogo />
    <div>
      <h1 className="text-xl font-bold text-gray-900">iAfrica.com</h1>
      <p className="text-sm text-emerald-600">Educational Excellence</p>
    </div>
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
    { name: 'Programs', path: '/Programs' },
    { name: 'Courses', path: '/Courses' },
    { name: 'Lecturers', path: '/Lecturers' },
    { name: 'Enroll', path: '/Enroll' },
    { name: 'Resources', path: '/Resources' },
    { name: 'Certificates', path: '/Certificates' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <SiteBrand />

          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`font-medium transition-colors duration-200 ${location.pathname === item.path ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}>
                {item.name}
              </Link>
            ))}
          </nav>

          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`text-left py-2 px-4 rounded-md transition-colors ${location.pathname === item.path ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'}`}>
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
