import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, DollarSign } from 'lucide-react';
import Input from '../UI/Input.jsx';
import Button from '../UI/Button.jsx';
import './login.css'
import LoadingSpinner from '../UI/LoadingSpinner.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSwitchToRegister, onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      // Store user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      if (onLogin) {
        onLogin({ name: data.name, token: data.token });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-bg">
              <DollarSign className="login-logo" />
            </div>
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your expense tracker</p>
        </div>

        <form className="login-form-wrapper" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="login-error">
              {errors.general}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <div className="login-password-wrapper">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-password-toggle"
            >
              {showPassword ? <EyeOff className="login-password-icon" /> : <Eye className="login-password-icon" />}
            </button>
          </div>

          <div className="login-options">
            <label className="login-remember-label">
              <input type="checkbox" className="login-remember-checkbox" />
              <span className="login-remember-text">Remember me</span>
            </label>
            <a href="#" className="login-forgot-link">
              Forgot password?
            </a>
          </div>
          <div className="login-btn-container">
            <Button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="login-switch-btn"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
