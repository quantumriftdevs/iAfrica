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

// About Page Component
const AboutPage = () => {
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [visionRef, visionVisible] = useScrollAnimation();
  const [valuesRef, valuesVisible] = useScrollAnimation();
  
  const values = [
    {
      title: "Innovation",
      description: "We embrace cutting-edge technologies to provide solutions that exceed expectations.",
      icon: "🚀"
    },
    {
      title: "Quality",
      description: "Every product and service we deliver meets the highest international standards.",
      icon: "⭐"
    },
    {
      title: "Trust",
      description: "We build lasting relationships through transparency and reliable service delivery.",
      icon: "🤝"
    },
    {
      title: "Excellence",
      description: "Our commitment to excellence drives us to continuously improve and innovate.",
      icon: "🏆"
    }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4">
          <div ref={aboutRef} className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About Cossy White Limited</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Headquartered in Abuja, Nigeria, Cossy White Limited is a diversified enterprise driven by innovation, 
              quality, and trust. We serve governments, corporations, investors, and discerning individuals who demand only the best.
            </p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Modern office building"
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded with a vision to bridge the gap between cutting-edge technology and market needs, 
                  Cossy White Limited has grown into a trusted partner across multiple industries.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From our headquarters in Abuja, we've expanded our reach globally, serving clients across 
                  Africa and beyond with our comprehensive range of security, agricultural, and automotive solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={visionRef} className={`grid md:grid-cols-2 gap-12 transition-all duration-1000 ${
            visionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-8 rounded-2xl text-white">
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg leading-relaxed">
                To become Africa's leading diversified enterprise, recognized globally for innovation, 
                quality, and sustainable business practices that create value for all stakeholders.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To deliver world-class solutions across security, agriculture, and automotive sectors 
                while empowering communities, protecting assets, and creating sustainable wealth for all stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={valuesRef} className={`text-center mb-16 transition-all duration-1000 ${
            valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These values guide every decision we make and every relationship we build
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                           transform hover:-translate-y-2 text-center
                           ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


export default AboutPage