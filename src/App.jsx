import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import ProgramsPage from './Pages/ProgramsPage';
import CoursesPage from './Pages/CoursesPage';
import LecturersPage from './Pages/LecturersPage';
import EnrollPage from './Pages/Enroll';
import ResourcesPage from './Pages/ResourcesPage';
import CertificatesPage from './Pages/Certificatespage';
import PrivacyPage from './Pages/PrivacyPage';
import TermsPage from './Pages/TermsPage';
import ContactPage from './Pages/ContactPage';
import NotFoundPage from './Pages/404';
import LoginPage from './Pages/LoginPage';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
// Admin pages
import AdminDashboard from './Pages/admin/Dashboard';
import AdminUsers from './Pages/admin/Users';
import AdminPrograms from './Pages/admin/Programs';
import AdminCourses from './Pages/admin/Courses';
import AdminClasses from './Pages/admin/Classes';
import AdminPayments from './Pages/admin/Payments';
import AdminCertificates from './Pages/admin/Certificates';
import AdminSeasons from './Pages/admin/Seasons';
// Lecturer pages
import LecturerDashboard from './Pages/lecturer/Dashboard';
import LecturerClasses from './Pages/lecturer/Classes';
import AdminGrades from './Pages/admin/Grades';
import LecturerResources from './Pages/lecturer/Resources';
// Student pages
import StudentDashboard from './Pages/student/Dashboard';
import MyCourses from './Pages/student/MyCourses';
import MyClasses from './Pages/student/MyClasses';
import StudentGrades from './Pages/student/Grades';
import StudentCertificates from './Pages/student/Certificates';
import StudentPayments from './Pages/student/Payments';
import ProfileEdit from './Pages/student/ProfileEdit';
import ChangePassword from './Pages/student/ChangePassword';
// sidebars are provided by the role-specific layout components
// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import LecturerLayout from './layouts/LecturerLayout';
import StudentLayout from './layouts/StudentLayout';

// Wrapper component to pass navigate function to pages
const PageWrapper = ({ children }) => {
  const _navigate = useNavigate();
  
  return React.cloneElement(children, { navigate: _navigate });
};

// Main App Component with Router and Layouts
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes inside PublicLayout (has Header/Footer) */}
        <Route element={<PublicLayout />}>
          <Route index element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="programs" element={<PageWrapper><ProgramsPage /></PageWrapper>} />
          <Route path="Courses" element={<PageWrapper><CoursesPage /></PageWrapper>} />
          <Route path="Lecturers" element={<PageWrapper><LecturersPage /></PageWrapper>} />
          <Route path="Enroll" element={<PageWrapper><EnrollPage /></PageWrapper>} />
          <Route path="Resources" element={<PageWrapper><ResourcesPage /></PageWrapper>} />
          <Route path="Certificates" element={<PageWrapper><CertificatesPage /></PageWrapper>} />
          <Route path="terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
          <Route path="privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
          <Route path="contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
          <Route path="login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Route>

        {/* Admin routes inside AdminLayout (no public header/footer) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/programs" element={<AdminPrograms />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/grades" element={<AdminGrades />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/seasons" element={<AdminSeasons />} />
        </Route>

        {/* Lecturer routes inside LecturerLayout */}
        <Route element={<LecturerLayout />}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/classes" element={<LecturerClasses />} />
          <Route path="/lecturer/resources" element={<LecturerResources />} />
        </Route>

        {/* Student routes inside StudentLayout */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-classes" element={<MyClasses />} />
          <Route path="/grades" element={<StudentGrades />} />
          <Route path="/my-certificates" element={<StudentCertificates />} />
          <Route path="/payments" element={<StudentPayments />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;