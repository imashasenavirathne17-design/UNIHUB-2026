import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InternshipBoard from "./pages/internship/InternshipBoard";
import InternshipDetail from "./pages/internship/InternshipDetail";
import MyApplications from "./pages/internship/MyApplications";
import CVBuilder from "./pages/internship/CVBuilder";
import OrgDashboard from "./pages/internship/OrgDashboard";
import SavedInternships from "./pages/internship/SavedInternships";
import SkillMarketplace from "./pages/skills/SkillMarketplace";
import ExamsModule from "./pages/exams/OnExam_ExamsModule";
import BookingDashboard from "./pages/labhall/BookingDashboard";
import AnalyticsDashboard from "./pages/labhall/AnalyticsDashboard";
import LabHallLogin from "./pages/labhall/Login";
import LostFoundDashboard from "./pages/lostfound/LostFoundDashboard";
import EventDashboard from "./pages/events/EventDashboard";
import EventManagement from "./pages/events/EventManagement";
import AdminEventDashboard from "./pages/events/AdminEventDashboard";
import EventDetail from "./pages/events/EventDetail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Landing/Root logic */}
        <Route index element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
              <span className="text-xs font-bold tracking-widest text-unihub-teal uppercase mb-4 bg-unihub-mint/30 px-4 py-1.5 rounded-full ring-1 ring-unihub-teal/20">University Management Reimagined</span>
              <h1 className="text-5xl md:text-6xl font-bold text-unihub-text mb-6 tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-unihub-teal to-teal-400">UniHub</span>
              </h1>
              <p className="text-lg text-unihub-textMuted max-w-2xl mb-10 leading-relaxed">
                A modern, comprehensive ecosystem designed to help students, lecturers, and faculty thrive together through seamless learning, precise evaluation, and vibrant opportunities.
              </p>
              <div className="flex sm:flex-row flex-col gap-4">
                <Link to="/register" className="bg-unihub-coral hover:bg-unihub-coralHover text-white px-8 py-3.5 rounded-univ font-semibold shadow-card transition-all hover:-translate-y-0.5">
                  Get Started Today
                </Link>
                <Link to="/login" className="bg-white border border-gray-200 hover:border-unihub-teal hover:shadow-soft text-unihub-text hover:text-unihub-teal px-8 py-3.5 rounded-univ font-semibold shadow-sm transition-all">
                  Log Back In
                </Link>
              </div>
            </div>
          )
        } />

        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="labhall/login" element={<LabHallLogin />} />

        {/* Protected Dashboard & Modules */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Phase 2: Online Exams */}
        <Route path="exams/*" element={<ProtectedRoute><ExamsModule /></ProtectedRoute>} />

        {/* Phase 3: Lab Hall Booking System */}
        <Route path="facilities" element={<ProtectedRoute><BookingDashboard /></ProtectedRoute>} />
        <Route path="facilities/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />

        {/* Phase 5: Internship & Skill Management */}
        <Route path="internships" element={<ProtectedRoute><InternshipBoard /></ProtectedRoute>} />
        <Route path="internships/:id" element={<ProtectedRoute><InternshipDetail /></ProtectedRoute>} />
        <Route path="my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="saved-internships" element={<ProtectedRoute><SavedInternships /></ProtectedRoute>} />
        <Route path="cv-builder" element={<ProtectedRoute><CVBuilder /></ProtectedRoute>} />
        <Route path="org-dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
        <Route path="skills" element={<ProtectedRoute><SkillMarketplace /></ProtectedRoute>} />
        <Route path="lost-found" element={<ProtectedRoute><LostFoundDashboard /></ProtectedRoute>} />
        
        {/* Phase 6: Event Management */}
        <Route path="events" element={<ProtectedRoute><EventDashboard /></ProtectedRoute>} />
        <Route path="events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="events/manage" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
        <Route path="events/admin" element={<ProtectedRoute><AdminEventDashboard /></ProtectedRoute>} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
