import React, { useState, useEffect } from 'react';
import { getCourses } from '../utils/api';
import { Book, PlayCircle, CheckCircle, Users, Clock, ChevronRight, Star } from 'lucide-react';

// Animation Hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();

  // fallback is a stable module-scope constant; suppress exhaustive-deps warning for this hook
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};


const CoursesPage = ({ navigate }) => {
  const [coursesRef, coursesVisible] = useScrollAnimation();
  const [detailsRef, detailsVisible] = useScrollAnimation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCourses();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setCourses(data);
      } catch {
        // ignore
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="pt-20 text-center">Loading courses...</div>;
  if (!loading && (!Array.isArray(courses) || courses.length === 0)) return (
    <div className="pt-20 text-center">
      <h3 className="text-xl font-semibold">No courses available</h3>
      <p className="text-gray-600">We're not showing any courses right now. Please check back later.</p>
    </div>
  );

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div
            ref={coursesRef}
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              coursesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center mb-6">
              <Book size={64} className="text-emerald-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Explore Our Courses</h1>
            <p className="text-xl leading-relaxed mb-8 text-emerald-100">
              Whether you’re starting fresh or advancing your career, our curated selection of courses 
              gives you the skills to thrive in today’s tech-driven world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-emerald-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <PlayCircle size={16} className="mr-2" /> Practical Lessons
              </span>
              <span className="bg-emerald-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Users size={16} className="mr-2" /> Community Support
              </span>
              <span className="bg-emerald-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Star size={16} className="mr-2" /> Certified Completion
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={detailsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  detailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-emerald-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {course.category}
                      </span>
                      <span className="flex items-center text-yellow-500 font-semibold">
                        ★ {course.rating}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{course.description}</p>

                    <div className="flex items-center justify-between text-gray-700 mb-4">
                      <div className="flex items-center">
                        <Clock size={18} className="mr-2 text-emerald-600" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users size={18} className="mr-2 text-emerald-600" />
                        <span>{course.students}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="font-semibold text-gray-900 mb-2">Modules:</p>
                      <ul className="space-y-1">
                        {course.modules.map((module, mIndex) => (
                          <li key={mIndex} className="flex items-start text-gray-700">
                            <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5" />
                            {module}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-700">{course.price}</span>
                      <button
                        onClick={() => navigate("/Enroll")}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center"
                      >
                        Enroll <ChevronRight size={18} className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Need Guidance Choosing a Course?</h2>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
            Talk to our mentors and find the perfect course to match your career goals and experience level.
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

export default CoursesPage;
