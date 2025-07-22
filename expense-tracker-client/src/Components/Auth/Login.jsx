import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, DollarSign, CreditCard, PiggyBank, Wallet, Coins, TrendingUp, Receipt, Target } from 'lucide-react';
import Input from '../UI/Input.jsx';
import Button from '../UI/Button.jsx';
import './login.css'
import LoadingSpinner from '../UI/LoadingSpinner.jsx';
import { useNavigate } from 'react-router-dom';
import Herosection from '../UI/HeroSection.jsx';

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

  // Background icons data with random positions
  const backgroundIcons = [
    { Icon: DollarSign, top: '10%', left: '15%', size: 48 },
    { Icon: CreditCard, top: '25%', left: '40%', size: 32 },
    { Icon: PiggyBank, top: '15%', left: '75%', size: 40 },
    { Icon: Wallet, top: '85%', left: '45%', size: 36 },
    { Icon: Coins, top: '70%', left: '85%', size: 44 },
    // { Icon: TrendingUp, top: '80%', left: '12%', size: 38 },
    { Icon: Receipt, top: '60%', left: '90%', size: 32 },
    // { Icon: Target, top: '35%', left: '5%', size: 42 },
    // { Icon: DollarSign, top: '90%', left: '88%', size: 36 },
    // { Icon: CreditCard, top: '5%', left: '92%', size: 28 },
    // { Icon: PiggyBank, top: '55%', left: '3%', size: 34 },
    // { Icon: Wallet, top: '20%', left: '2%', size: 40 },
    // { Icon: Coins, top: '85%', left: '95%', size: 30 },
    { Icon: TrendingUp, top: '40%', left: '92%', size: 36 },
    { Icon: Receipt, top: '75%', left: '6%', size: 32 },
  ];

  return (
    <div className="login-container">
      {/* Background Icons */}
      <div className="background-icons">
        {backgroundIcons.map((item, index) => (
          <item.Icon
            key={index}
            className="bg-icon"
            style={{
              top: item.top,
              left: item.left,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          />
        ))}
      </div>

      <div className="HeroSection">
        <Herosection/>
      </div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-bg">
              <DollarSign className="login-logo" />
            </div>
          </div>
          <h2 className="login-title">Expenzo</h2>
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