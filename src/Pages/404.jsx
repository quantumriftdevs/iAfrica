import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Truck, Sprout, Users, Phone, Mail, MapPin, Star, ShoppingCart, Eye, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

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

const NotFoundPage = ({ navigate }) => {
  const [animationRef, animationVisible] = useScrollAnimation();
  
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div ref={animationRef} className={`transition-all duration-1000 ${
          animationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Large 404 */}
          <div className="mb-8">
            <h1 className="text-9xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 leading-none">
              404
            </h1>
          </div>
          
          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The page you're looking for seems to have wandered off. Don't worry though, 
              our Resources at Cossy White Limited is always here to help you find what you need.
            </p>
          </div>
          
          {/* Illustration */}
          <div className="mb-8">
            <div className="relative mx-auto w-64 h-64 lg:w-80 lg:h-80">
              {/* Background circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full opacity-50"></div>
              
              {/* Search icon illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Eye size={80} className="text-emerald-500 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold 
                        hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl flex items-center group"
            >
              <ArrowRight className="mr-2 group-hover:-translate-x-1 transition-transform rotate-180" />
              Back to Home
            </button>
            
            <button
              onClick={() => navigate('/contact')}
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold
                        hover:bg-emerald-600 hover:text-white transform hover:scale-105 transition-all duration-200
                        flex items-center group"
            >
              <Phone className="mr-2 group-hover:rotate-12 transition-transform" size={18} />
              Contact Support
            </button>
          </div>
          
          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/Programs')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200
                          flex items-center group"
              >
                <Shield size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                Programs
              </button>
              <button
                onClick={() => navigate('/Courses')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200
                          flex items-center group"
              >
                <Sprout size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                Courses
              </button>
              <button
                onClick={() => navigate('/Lecturers')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200
                          flex items-center group"
              >
                <Truck size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                Lecturers
              </button>
              <button
                onClick={() => navigate('/Enroll')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200
                          flex items-center group"
              >
                <ShoppingCart size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                Enroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;