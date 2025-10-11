import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, GraduationCap, Users, Clock, Calendar, Award, Video, FileText, CheckCircle } from 'lucide-react';

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
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return [ref, isVisible];
};

// Programs Page
const ProgramsPage = ({ navigate }) => {
  const [programsRef, programsVisible] = useScrollAnimation();
  const [detailsRef, detailsVisible] = useScrollAnimation();
  
  const programs = [
    {
      name: "Web Development",
      description: "Master modern web development from front-end to back-end. Build responsive, dynamic websites and web applications using the latest technologies.",
      grades: [
        {
          level: "Beginner",
          duration: "3 Months",
          price: "₦50,000",
          courses: ["HTML & CSS Fundamentals", "JavaScript Basics", "Responsive Design"]
        },
        {
          level: "Advanced",
          duration: "3 Months",
          price: "₦75,000",
          courses: ["React.js Development", "Node.js & Express", "Database Integration"]
        }
      ],
      features: ["Live Interactive Classes", "Real-world Projects", "Industry Mentorship", "Job Placement Support", "Verified Certificate"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      students: "450+",
      rating: "4.8"
    },
    {
      name: "Digital Marketing",
      description: "Learn to create and execute successful digital marketing campaigns. Master SEO, social media, content marketing, and analytics.",
      grades: [
        {
          level: "Beginner",
          duration: "2 Months",
          price: "₦40,000",
          courses: ["Marketing Fundamentals", "Social Media Basics", "Content Creation"]
        },
        {
          level: "Advanced",
          duration: "2 Months",
          price: "₦60,000",
          courses: ["SEO & SEM Strategies", "Analytics & Data", "Campaign Management"]
        }
      ],
      features: ["Live Strategy Sessions", "Campaign Projects", "Industry Tools Access", "Portfolio Building", "Verified Certificate"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      students: "380+",
      rating: "4.7"
    },
    {
      name: "Graphic Design",
      description: "Transform your creative ideas into stunning visual designs. Learn industry-standard tools and design principles for print and digital media.",
      grades: [
        {
          level: "Beginner",
          duration: "2.5 Months",
          price: "₦45,000",
          courses: ["Design Principles", "Adobe Photoshop", "Typography Basics"]
        },
        {
          level: "Advanced",
          duration: "2.5 Months",
          price: "₦70,000",
          courses: ["Adobe Illustrator Pro", "Brand Identity Design", "UI/UX Fundamentals"]
        }
      ],
      features: ["Live Design Sessions", "Portfolio Projects", "Adobe Suite Access", "Client Project Simulation", "Verified Certificate"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      students: "320+",
      rating: "4.9"
    },
    {
      name: "Data Analytics",
      description: "Unlock the power of data to drive business decisions. Learn data analysis, visualization, and interpretation using industry-leading tools.",
      grades: [
        {
          level: "Beginner",
          duration: "3 Months",
          price: "₦55,000",
          courses: ["Data Fundamentals", "Excel for Analysis", "Statistics Basics"]
        },
        {
          level: "Advanced",
          duration: "3 Months",
          price: "₦80,000",
          courses: ["Python for Data Science", "Power BI & Tableau", "Predictive Analytics"]
        }
      ],
      features: ["Live Data Labs", "Real Dataset Projects", "Industry Case Studies", "Tool Certifications", "Verified Certificate"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      students: "280+",
      rating: "4.8"
    }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div ref={programsRef} className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-center mb-6">
              <BookOpen size={64} className="text-emerald-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Our Programs</h1>
            <p className="text-xl leading-relaxed mb-8 text-emerald-100">
              Explore our comprehensive educational programs designed to equip you with in-demand skills. 
              Each program offers beginner and advanced levels with structured courses, expert lecturers, 
              and hands-on learning through live interactive classes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Video size={16} className="mr-2" /> Live Classes
              </span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Award size={16} className="mr-2" /> Verified Certificates
              </span>
              <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Users size={16} className="mr-2" /> Expert Lecturers
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={detailsRef} className="space-y-20">
            {programs.map((program, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  detailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="relative">
                      <img
                        src={program.image}
                        alt={program.name}
                        className="rounded-2xl shadow-xl w-full h-80 object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center">
                          <Users size={16} className="text-emerald-600 mr-2" />
                          <span className="font-semibold text-gray-900">{program.students} Students</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-semibold text-gray-900">{program.rating}/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{program.name}</h2>
                    <p className="text-xl text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      {program.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <CheckCircle size={20} className="text-emerald-600 mr-3" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  {program.grades.map((grade, gradeIndex) => (
                    <div
                      key={gradeIndex}
                      className="bg-gradient-to-br from-gray-50 to-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{grade.level} Level</h3>
                        <span className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                          {grade.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6 text-gray-600">
                        <div className="flex items-center">
                          <Clock size={18} className="mr-2 text-emerald-600" />
                          <span>{grade.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen size={18} className="mr-2 text-emerald-600" />
                          <span>{grade.courses.length} Courses</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <p className="font-semibold text-gray-900 mb-3">Course Breakdown:</p>
                        {grade.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 mt-2"></div>
                            <span className="text-gray-700">{course}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => navigate("/Enroll")}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center"
                      >
                        Enroll Now
                        <ChevronRight size={20} className="ml-2" />
                      </button>
                    </div>
                  ))}
                </div>
                {index < programs.length - 1 && (
                  <div className="border-t border-gray-200 mt-12"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Not Sure Which Program to Choose?</h2>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
            Our advisors are here to help you select the right program based on your goals and experience level.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg"
          >
            Get Free Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProgramsPage;
