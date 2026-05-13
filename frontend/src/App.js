import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CarList from './components/cars/CarList';
import BookingForm from './components/bookings/BookingForm';
import MyBookings from './components/bookings/MyBookings';
import Auth from './components/common/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppContent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [logoutMsg, setLogoutMsg] = React.useState('');

  const handleLogout = () => {
    logout();
    setLogoutMsg('Signed out successfully!');
    setTimeout(() => setLogoutMsg(''), 3000);
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

  const goHome = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">WheelWise</Link>
          <div className="nav-links">
            <a href="/" onClick={goHome} className="nav-link">Home</a>
            <Link to="/my-bookings" className="nav-link">My Bookings</Link>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }} className="nav-link">About Us</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="nav-link">Contact</a>
            {isAuthenticated ? (
              <>
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
      {logoutMsg && <div className="toast-message">{logoutMsg}</div>}
      <Routes>
        <Route path="/" element={<CarList />} />
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
        <Route path="/cars/:carId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
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
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/auth">Sign In</Link>
          </div>
          <div className="footer-col">
            <h4>Car Types</h4>
            <a href="#sedan">Sedan</a>
            <a href="#suv">SUV</a>
            <a href="#coupe">Coupe</a>
            <a href="#truck">Truck</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:support@wheelwise.com">support@wheelwise.com</a>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
            <a href="#map">123 Main St, New York</a>
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
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
