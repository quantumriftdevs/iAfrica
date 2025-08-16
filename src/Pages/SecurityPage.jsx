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

// Security Technologies Page
const SecurityPage = ({ navigate }) => {
  const [securityRef, securityVisible] = useScrollAnimation();
  const [productsRef, productsVisible] = useScrollAnimation();
  
  const securityProducts = [
    {
      name: "Surveillance Drones",
      description: "Advanced drones equipped with 4K cameras, night vision, and thermal imaging capabilities for comprehensive aerial surveillance.",
      features: ["4K Ultra HD Camera", "Night Vision Technology", "GPS Tracking & Mapping", "Real-time Video Streaming", "Weather Resistant Design"],
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "CCTV Systems",
      description: "High-definition surveillance camera systems with intelligent analytics and remote monitoring capabilities.",
      features: ["HD Video Quality", "Motion Detection", "Night Vision", "Mobile App Control", "Cloud Storage"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Biometric Access Control",
      description: "Advanced biometric systems for secure access control using fingerprint, facial recognition, and RFID technology.",
      features: ["Multi-biometric Support", "RFID Integration", "Mobile Access", "Audit Trail", "Anti-spoofing Technology"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-green-800 text-white">
        <div className="container mx-auto px-4">
          <div ref={securityRef} className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            securityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-center mb-6">
              <Shield size={64} className="text-emerald-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Security Technologies</h1>
            <p className="text-xl leading-relaxed mb-8 text-emerald-100">
              We design, procure, and deploy state-of-the-art surveillance drones, high-definition CCTV networks, 
              biometric access controls, and intelligent alarm systems for comprehensive protection solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">Government Agencies</span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">Corporate Security</span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">Estate Protection</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={productsRef} className="space-y-16">
            {securityProducts.map((product, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
                  productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="rounded-2xl shadow-xl w-full h-80 object-cover"
                  />
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h3>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                  <div className="space-y-3">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("/contact")} className="mt-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200">
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;