import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, GraduationCap, Users, Award, Video, Target, Heart, Zap, Shield } from 'lucide-react';

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
      title: "Quality Education",
      description: "We deliver world-class learning experiences with structured programs and expert lecturers.",
      icon: "🎓"
    },
    {
      title: "Student Success",
      description: "Every student's success is our priority, supported by comprehensive resources and guidance.",
      icon: "⭐"
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology like LiveKit for immersive learning experiences.",
      icon: "🚀"
    },
    {
      title: "Accessibility",
      description: "Education should be available to all, with flexible schedules and affordable programs.",
      icon: "🌍"
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
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About iAfrica Education</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              iAfrica.com Educational Section is a comprehensive learning platform dedicated to empowering 
              individuals with practical skills through structured programs, expert instruction, and interactive 
              live classes. We bridge the gap between aspiration and achievement.
            </p>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students learning together"
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded with a vision to democratize quality education, iAfrica Education has become 
                  a trusted platform for thousands of learners seeking to advance their careers and 
                  acquire valuable skills.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From our base in Nigeria, we've expanded our reach across Africa, offering programs 
                  that combine theoretical knowledge with practical application, ensuring our students 
                  are job-ready upon completion.
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
              <div className="flex items-center mb-4">
                <Target className="mr-3" size={32} />
                <h3 className="text-3xl font-bold">Our Vision</h3>
              </div>
              <p className="text-lg leading-relaxed">
                To become Africa's premier online educational platform, recognized for transforming 
                lives through accessible, high-quality education that empowers learners to achieve 
                their full potential and contribute meaningfully to society.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <Heart className="mr-3 text-emerald-600" size={32} />
                <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To deliver comprehensive, industry-relevant educational programs through live interactive 
                classes, expert lecturers, and verified certification that enables students to build 
                successful careers and create lasting impact in their communities.
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
              These principles guide our approach to education and define our commitment to every student
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

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Our Platform Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A seamless learning experience designed for your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-emerald-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Browse & Enroll</h3>
              <p className="text-gray-600">
                Explore our programs with beginner and advanced levels. Choose your path and 
                enroll securely through Paystack payment gateway.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-emerald-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Attend Live Classes</h3>
              <p className="text-gray-600">
                Join interactive live sessions with expert lecturers, access course materials, 
                and collaborate with fellow students in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-emerald-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Certificates</h3>
              <p className="text-gray-600">
                Complete assessments, finish your program, and receive verified digital 
                certificates with unique verification codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">1000+</div>
              <div className="text-emerald-100 text-lg">Active Students</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">50+</div>
              <div className="text-emerald-100 text-lg">Expert Lecturers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">30+</div>
              <div className="text-emerald-100 text-lg">Programs</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">95%</div>
              <div className="text-emerald-100 text-lg">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;