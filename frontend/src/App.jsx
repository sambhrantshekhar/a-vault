import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import SubmissionPage from './pages/assignments/SubmissionPage';
import EvaluationPage from './pages/assignments/EvaluationPage';
import SubmissionsList from './pages/assignments/SubmissionsList';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Default Route Redirect
const RootRedirect = () => {
  const { user, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" />;
  if (user?.role === 'teacher') return <Navigate to="/teacher-dashboard" />;
  if (user?.role === 'student') return <Navigate to="/student-dashboard" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/teacher-dashboard" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/submit/:assignment_id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SubmissionPage />
            </ProtectedRoute>
          } />

          <Route path="/evaluate/:submission_id" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <EvaluationPage />
            </ProtectedRoute>
          } />

          <Route path="/assignments/:assignment_id/submissions" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <SubmissionsList />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
