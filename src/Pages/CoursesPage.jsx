import React, { useState, useEffect } from 'react';
import { getCourses } from '../utils/api';
import { Book, PlayCircle, Users, Star } from 'lucide-react';


const CoursesPage = ({ navigate }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCourses();
        console.log(data);
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
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div
            className='max-w-4xl mx-auto text-center transition-all duration-1000 opacity-100 translate-y-0'
          >
            <div className="flex items-center justify-center mb-6">
              <Book size={64} className="text-emerald-300" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Explore Our Courses</h1>
            <p className="text-xl leading-relaxed mb-8 text-emerald-100">
              Whether you're starting fresh or advancing your career, our curated selection of courses gives you the skills to thrive in today's tech-driven world.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, index) => (
              <div
                key={index}
                className='transition-all duration-1000 opacity-100 translate-y-0'
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{course.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-700">Lecturer: {course.lecturer.name}</span>
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
