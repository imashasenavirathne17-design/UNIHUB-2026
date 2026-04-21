import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { BookOpen, Shield, ChevronRight } from "lucide-react";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InternshipBoard from "./pages/internship/InternshipBoard";
import InternshipDetails from "./pages/internship/InternshipDetails";
import MyApplications from "./pages/internship/MyApplications";
import CVBuilder from "./pages/internship/CVBuilder";
import OrgDashboard from "./pages/internship/OrgDashboard";
import SavedInternships from "./pages/internship/SavedInternships";
import SkillMarketplace from "./pages/skills/SkillMarketplace";
import ExamsModule from "./pages/exams/OnExam_ExamsModule";
import OnKuppi_KuppiPage from "./pages/kuppi/OnKuppi_KuppiPage";
import BookingDashboard from "./pages/labhall/BookingDashboard";
import AnalyticsDashboard from "./pages/labhall/AnalyticsDashboard";
import LabHallLogin from "./pages/labhall/Login";
import LabHallRegister from "./pages/labhall/Register";
import LostFoundDashboard from "./pages/lostfound/LostFoundDashboard";
import EventDashboard from "./pages/events/EventDashboard";
import EventManagement from "./pages/events/EventManagement";
import AdminEventDashboard from "./pages/events/AdminEventDashboard";
import OrganizerAnalyticsDashboard from "./pages/events/OrganizerAnalyticsDashboard";
import EventDetail from "./pages/events/EventDetail";
import AdminDashboard from "./pages/AdminDashboard";

import Landing from "./pages/Landing";

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
            user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <Landing />
          )
        } />

        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="facilities/login" element={<LabHallLogin />} />
        <Route path="facilities/register" element={<LabHallRegister />} />

        {/* Protected Dashboard & Modules */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Phase 2: Online Exams */}
        <Route path="exams/*" element={<ProtectedRoute><ExamsModule /></ProtectedRoute>} />
        <Route path="kuppi" element={<ProtectedRoute><OnKuppi_KuppiPage /></ProtectedRoute>} />

        {/* Phase 3: Lab Hall Booking System */}
        <Route path="facilities" element={<ProtectedRoute><BookingDashboard /></ProtectedRoute>} />
        <Route path="facilities/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />

        {/* Phase 5: Internship & Skill Management */}
        <Route path="internships" element={<ProtectedRoute><InternshipBoard /></ProtectedRoute>} />
        <Route path="internships/:id" element={<ProtectedRoute><InternshipDetails /></ProtectedRoute>} />
        <Route path="my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="saved-internships" element={<ProtectedRoute><SavedInternships /></ProtectedRoute>} />
        <Route path="cv-builder" element={<ProtectedRoute><CVBuilder /></ProtectedRoute>} />
        <Route path="org-dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
        <Route path="skills" element={<ProtectedRoute><SkillMarketplace /></ProtectedRoute>} />
        <Route path="lost-found" element={<ProtectedRoute><LostFoundDashboard /></ProtectedRoute>} />
        
        {/* Phase 6: Event Management */}
        <Route path="events" element={<ProtectedRoute><EventDashboard /></ProtectedRoute>} />
        <Route path="events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="events/manage" element={<ProtectedRoute allowedRoles={['organizer', 'event organizer']}><EventManagement /></ProtectedRoute>} />
        <Route path="events/organizer-analytics" element={<ProtectedRoute allowedRoles={['organizer', 'event organizer']}><OrganizerAnalyticsDashboard /></ProtectedRoute>} />
        <Route path="events/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminEventDashboard /></ProtectedRoute>} />
        <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
