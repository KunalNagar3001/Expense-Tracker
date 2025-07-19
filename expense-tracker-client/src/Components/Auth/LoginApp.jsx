import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from '../Dashboard/DashBoard.jsx';

const LoginApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegister = (formData) => {
    // Registration successful
    alert('Registration successful! (This is just a demo)');
    setCurrentView('login');
  };

  const handleLogout = () => {
    console.log('LoginApp handleLogout called');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUser(null);
    setCurrentView('login');
  };

  useEffect(() => {
    console.log('LoginApp user:', user, 'currentView:', currentView);
  }, [user, currentView]);

  return (
    <div className="login-app-wrapper">
      {currentView === 'login' && !user ? (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLogin={handleLogin}
        />
      ) : currentView === 'register' ? (
        <Register
          onSwitchToLogin={() => setCurrentView('login')}
          onRegister={handleRegister}
        />
      ) : user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : null}
    </div>
  );
};

export default LoginApp;