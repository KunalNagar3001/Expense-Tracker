import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, PiggyBank, Wallet, Coins, TrendingUp, Receipt } from 'lucide-react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from '../Dashboard/DashBoard.jsx';
import Herosection from '../UI/HeroSection.jsx';
import './login.css';

const LoginApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // The userData is passed to Dashboard as a prop here:
  // <Dashboard user={user} onLogout={handleLogout} />
  // This happens in the return statement of LoginApp.
  // When handleLogin is called, it sets the user state with setUser(userData).
  // React re-renders LoginApp, and the updated user state is passed as the "user" prop to Dashboard.
  // That's how Dashboard receives userData as a prop, even though you don't see userData directly passed in handleLogin.
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('dashboard');
    navigate('/dashboard');
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
    localStorage.removeItem('user'); // Remove user from localStorage
    setUser(null);
    setCurrentView('login');
    navigate('/'); // Redirect to login page
  };

  useEffect(() => {
    console.log('LoginApp user:', user, 'currentView:', currentView);
  }, [user, currentView]);

  const backgroundIcons = [
    { Icon: DollarSign, top: '10%', left: '15%', size: 48 },
    { Icon: CreditCard, top: '25%', left: '40%', size: 32 },
    { Icon: PiggyBank, top: '15%', left: '75%', size: 40 },
    { Icon: Wallet, top: '85%', left: '45%', size: 36 },
    { Icon: Coins, top: '70%', left: '85%', size: 44 },
    { Icon: Receipt, top: '60%', left: '90%', size: 32 },
    { Icon: TrendingUp, top: '40%', left: '92%', size: 36 },
    { Icon: Receipt, top: '75%', left: '6%', size: 32 },
  ];

  return (
    <div className="login-app-wrapper">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="login-container">
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
            <Herosection />
          </div>

          {currentView === 'login' ? (
            <Login
              onSwitchToRegister={() => setCurrentView('register')}
              onLogin={handleLogin}
            />
          ) : (
            <Register
              onSwitchToLogin={() => setCurrentView('login')}
              onRegister={handleRegister}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LoginApp;