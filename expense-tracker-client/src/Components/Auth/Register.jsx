import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, DollarSign, User } from 'lucide-react';
import Input from '../UI/Input.jsx';
import Button from '../UI/Button.jsx';
import LoadingSpinner from '../UI/LoadingSpinner.jsx';

export default function Register({ onSwitchToLogin, onRegister }) {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
  
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
      
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      
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
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setIsLoading(true);
      
      try {
        const response=await fetch('http://localhost:5001/register',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            name:formData.name,
            email:formData.email,
            password:formData.password
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setErrors({ general: data.message || 'Registration failed. Please try again.' });
          setIsLoading(false);
          return;
        }
      
        // Registration successful
        if (onRegister) {
          onRegister(formData);
        }
      } catch (error) {
        setErrors({ general: 'Registration failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo-wrapper">
              <div className="register-logo-bg">
                <DollarSign className="register-logo" />
              </div>
            </div>
            <h2 className="register-title">Create Account</h2>
            <p className="register-subtitle">Start tracking your expenses today</p>
          </div>

          <form className="register-form-wrapper" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="register-error">
                {errors.general}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={User}
              required
            />

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

            <div className="register-password-wrapper">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="register-password-toggle"
              >
                {showPassword ? <EyeOff className="register-password-icon" /> : <Eye className="register-password-icon" />}
              </button>
            </div>

            <div className="register-confirm-password-wrapper">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="register-confirm-password-toggle"
              >
                {showConfirmPassword ? <EyeOff className="register-confirm-password-icon" /> : <Eye className="register-confirm-password-icon" />}
              </button>
            </div>

            <div className="register-terms-wrapper">
              <input type="checkbox" className="register-terms-checkbox" required />
              <span className="register-terms-text">
                I agree to the{' '}
                <a href="#" className="register-terms-link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="register-terms-link">Privacy Policy</a>
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="register-submit-btn"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </Button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="register-switch-btn"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
}