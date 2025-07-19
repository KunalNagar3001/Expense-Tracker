import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, DollarSign } from 'lucide-react';

// UI Components
const Button = ({ children, variant = 'primary', type = 'button', disabled = false, onClick, className = '' }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline'
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;