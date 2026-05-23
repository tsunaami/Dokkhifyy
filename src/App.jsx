import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import AboutPage from './AboutPage';
import PrivacyPage from './PrivacyPage';
import TuitionPage from './TuitionPage';
import PaymentResult from './PaymentResult';

function App() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem('loggedUser') || localStorage.getItem('authUser') || 'null'
    );
    setLoggedUser(user);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    setLoggedUser(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0f0a0b]">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a0f12', color: '#f0ece8', border: '1px solid #6B0F1A' },
          }}
        />
        <Navbar loggedUser={loggedUser} handleLogout={handleLogout} />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage loggedUser={loggedUser} />} />
            <Route path="/courses" element={<CoursesPage loggedUser={loggedUser} />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={!loggedUser ? <LoginPage setLoggedUser={setLoggedUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!loggedUser ? <SignupPage setLoggedUser={setLoggedUser} /> : <Navigate to="/" />} 
            />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                loggedUser?.role === 'instructor' 
                  ? <InstructorDashboard loggedUser={loggedUser} /> 
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/my-learning" 
              element={
                loggedUser?.role === 'student' 
                  ? <StudentDashboard loggedUser={loggedUser} /> 
                  : <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                loggedUser?.role === 'admin' 
                  ? <AdminDashboard /> 
                  : <Navigate to="/login" />
              } 
            />

            {/* Static Content Routes */}
            <Route path="/tuition" element={<TuitionPage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
