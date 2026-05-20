import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import CarList from './components/cars/CarList';
import BookingForm from './components/bookings/BookingForm';
import MyBookings from './components/bookings/MyBookings';
import Auth from './components/common/Auth';
import AdminDashboard from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (!user?.is_staff && !user?.is_superuser) return <Navigate to="/" />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully!');
  };

  const scrollTo = (id) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">WheelWise</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link>
            <Link to="/my-bookings" className="nav-link">My Bookings</Link>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }} className="nav-link">About Us</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="nav-link">Contact</a>
            {isAuthenticated ? (
              <>
                {(user?.is_staff || user?.is_superuser) && <Link to="/admin" className="nav-link">Admin</Link>}
                <span className="nav-user">Hi, {user?.username}</span>
                <button onClick={handleLogout} className="nav-btn">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" className="nav-btn">Sign In</Link>
            )}
            <button onClick={toggleTheme} className="theme-toggle" title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </button>
          </div>
        </div>
      </nav>

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<CarList />} />
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
        <Route path="/cars/:carId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>

      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>WheelWise</h3>
            <p>Premium car rental service with the best selection of vehicles. Drive your dream car today with WheelWise.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            {isAuthenticated ? (
              <Link to="/my-bookings">My Bookings</Link>
            ) : (
              <Link to="/auth">Sign In</Link>
            )}
          </div>
          <div className="footer-col">
            <h4>Car Types</h4>
            <a href="#cars" onClick={(e) => { e.preventDefault(); scrollTo('cars'); }}>Sedan</a>
            <a href="#cars" onClick={(e) => { e.preventDefault(); scrollTo('cars'); }}>SUV</a>
            <a href="#cars" onClick={(e) => { e.preventDefault(); scrollTo('cars'); }}>Coupe</a>
            <a href="#cars" onClick={(e) => { e.preventDefault(); scrollTo('cars'); }}>Truck</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:support@wheelwise.com">support@wheelwise.com</a>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
            <a href="#contact">123 Main St, New York</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} WheelWise. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
