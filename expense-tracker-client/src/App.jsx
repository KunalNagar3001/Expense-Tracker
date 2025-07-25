import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginApp from './Components/Auth/LoginApp.jsx';
import Dashboard from './Components/Dashboard/DashBoard.jsx';
import PrivateRoute from './Components/Auth/PrivateRoute.jsx';
import Expenses from './Components/Expenses/Expenses.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginApp />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/expenses" element={<Expenses />} />
      </Routes>
    </Router>
  );
}

export default App;
