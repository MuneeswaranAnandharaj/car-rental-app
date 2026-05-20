import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [resetToken, setResetToken] = useState(null);
  const [resetUid, setResetUid] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === '1') {
      const uid = searchParams.get('uid');
      const token = searchParams.get('token');
      if (uid && token) {
        setResetUid(uid);
        setResetToken(token);
        setIsForgot(true);
        setForgotStep('reset');
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }

      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await fetch('http://localhost:8000/api/api-token-auth/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await response.json();
        const userData = { username: formData.username, email: '', is_staff: data.is_staff || false, is_superuser: data.is_superuser || false };
        login(data.token, userData);
        showToast('Signed in successfully!');
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Register
        const response = await fetch('http://localhost:8000/api/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Registration failed');
        }

        showToast('Account created successfully! Please sign in.');
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({
          username: formData.username,
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: '',
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');
    setLoading(true);

    try {
      if (forgotStep === 'email') {
        if (!formData.email) { throw new Error('Email is required'); }
        const res = await fetch('http://localhost:8000/api/request-password-reset/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');

        if (data.reset_url) {
          setResetUid(data.uid);
          setResetToken(data.token);
          setSuccess('Reset link generated. Proceed to set your new password.');
          setForgotStep('reset');
        } else {
          showToast('If an account with that email exists, a reset link has been sent.');
          setSuccess('If an account with that email exists, a reset link has been sent.');
        }
      } else {
        if (!formData.password || formData.password.length < 6) { throw new Error('Password must be at least 6 characters'); }
        if (formData.password !== formData.confirmPassword) { throw new Error('Passwords do not match'); }
        const res = await fetch('http://localhost:8000/api/reset-password/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: resetUid, token: resetToken, new_password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        showToast('Password reset successfully! Please sign in.');
        setIsForgot(false);
        setIsLogin(true);
        setFormData({ password: '', confirmPassword: '', email: '' });
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSubmitError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
    });
  };

  const openForgot = () => {
    setIsForgot(true);
    setForgotStep('email');
    setResetToken(null);
    setResetUid(null);
    setErrors({});
    setSubmitError('');
    setSuccess('');
    setFormData({ ...formData, password: '', confirmPassword: '', email: '' });
  };

  const closeForgot = () => {
    setIsForgot(false);
    setSubmitError('');
    setSuccess('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isForgot ? (forgotStep === 'email' ? 'Forgot Password' : 'Reset Password') : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p className="auth-subtitle">
            {isForgot ? (forgotStep === 'email' ? 'Enter your email to receive a reset link' : 'Enter your new password') : (isLogin ? 'Sign in to continue' : 'Join us today')}
          </p>
        </div>

        {submitError && (
          <div className="alert alert-error">
            {submitError}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {isForgot ? (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            {forgotStep === 'email' ? (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="Enter your registered email" />
                {errors.email && <p className="error-text">{errors.email}</p>}
                <button type="submit" disabled={loading} className="submit-btn" style={{marginTop: '1rem'}}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Enter new password" />
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Confirm new password" />
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
            <button type="button" onClick={closeForgot} className="toggle-btn" style={{marginTop: '1rem', width: '100%', textAlign: 'center'}}>
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className={`form-input ${errors.username ? 'error' : ''}`} placeholder="Enter your username" />
              {errors.username && <p className="error-text">{errors.username}</p>}
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="Enter your email" />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`form-input ${errors.first_name ? 'error' : ''}`} placeholder="First name" />
                    {errors.first_name && <p className="error-text">{errors.first_name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`form-input ${errors.last_name ? 'error' : ''}`} placeholder="Last name" />
                    {errors.last_name && <p className="error-text">{errors.last_name}</p>}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Enter your password" />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Confirm your password" />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            {isLogin && (
              <button type="button" onClick={openForgot} className="forgot-link">
                Forgot Password?
              </button>
            )}
          </form>
        )}

        {!isForgot && (
          <div className="auth-toggle">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
