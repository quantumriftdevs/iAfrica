import React, { useState, useEffect } from 'react';
import { getPrograms } from '../utils/api';
import { ChevronRight, BookOpen, Users, Award, Video, FileText, Calendar, ArrowRight, Menu, X, School, Clock, Globe } from 'lucide-react';

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


const HomePage = ({ navigate }) => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [statsRef, statsVisible] = useScrollAnimation();
  const [programsRef, programsVisible] = useScrollAnimation();

  const features = [
    {
      icon: Video,
      title: "Live Interactive Classes",
      description: "Join real-time classes with expert lecturers and interact with fellow students through our integrated LiveKit platform.",
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: FileText,
      title: "Comprehensive Resources",
      description: "Access course materials, notes, and resources anytime. All learning materials remain available throughout your journey.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Earn digital certificates upon program completion with unique verification codes you can share professionally.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  const stats = [
    { number: "1000+", label: "Active Students", icon: Users },
  { number: "50+", label: "Expert Lecturers", icon: School },
    { number: "30+", label: "Programs Available", icon: BookOpen },
    { number: "95%", label: "Completion Rate", icon: Award }
  ];

  const [programs, setPrograms] = useState([]);
  
  // module-scope fallback programs (stable reference for hooks)
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPrograms();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setPrograms(data.slice(0, 3));
      } catch {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, []);
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-emerald-50 via-white to-green-50 overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div ref={heroRef} className={`transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Learn Skills That 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600"> Transform Careers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join iAfrica.com's Educational Section and access structured programs with expert lecturers, 
              live classes, comprehensive materials, and verified certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/Enroll')}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold 
                          hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200
                          shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                Browse Programs
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold
                          hover:bg-emerald-600 hover:text-white transform hover:scale-105 transition-all duration-200"
              >
                How It Works
              </button>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning together"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Video className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Live Class in Progress</p>
                    <p className="text-sm text-gray-600">Join 50+ students learning right now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={featuresRef} className={`text-center mb-16 transition-all duration-1000 ${
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose iAfrica Education</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for a comprehensive learning experience, all in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500
                           transform hover:-translate-y-2 border border-gray-100 overflow-hidden
                           ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <feature.icon className="text-emerald-400" size={32} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <button className="text-emerald-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                    Learn More <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 ${
                  statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <stat.icon className="mx-auto mb-4" size={40} />
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-emerald-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div ref={programsRef} className={`text-center mb-16 transition-all duration-1000 ${
            programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our most popular programs with beginner and advanced levels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500
                           transform hover:-translate-y-2 ${programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{program.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <School size={20} className="text-emerald-600" />
                      <span>{program.levels}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen size={20} className="text-emerald-600" />
                      <span>{program.courses}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={20} className="text-emerald-600" />
                      <span>{program.duration}</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg font-semibold
                                   hover:from-emerald-700 hover:to-green-700 transition-all duration-200">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning with expert lecturers. Get certified and advance your career today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/Enroll')}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-lg font-semibold
                        hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl"
            >
              Browse All Programs
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold
                        hover:bg-emerald-600 hover:text-white transform hover:scale-105 transition-all duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;