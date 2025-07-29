import React from "react";
import { NavLink } from "react-router-dom";
import { DollarSign, Home, FileText, BarChart3, Settings, LogOut,PiggyBank,LineChart } from "lucide-react";
import "./sidebar.css";
import AddExpenseForm from "./AddExpenseForm";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-bg">
          <DollarSign className="sidebar-logo-icon" />
        </div>
        <span className="sidebar-app-name">Expenzo</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            "sidebar-nav-link" + (isActive ? " active" : "")
          }
        >
          <Home className="sidebar-nav-icon" />
          Dashboard
        </NavLink>
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            "sidebar-nav-link" + (isActive ? " active" : "")
          }
        >
          <FileText className="sidebar-nav-icon" />
          Expenses
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            "sidebar-nav-link" + (isActive ? " active" : "")
          }
        >
          <BarChart3 className="sidebar-nav-icon" />
          Analytics
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            "sidebar-nav-link" + (isActive ? " active" : "")
          }
        >
          <Settings className="sidebar-nav-icon" />
          Settings
        </NavLink>
       
        <NavLink 
        to="/Savings"
        className={({ isActive }) =>
          "sidebar-nav-link" + (isActive ? " active" : "")
        }
        >
          <PiggyBank className="sidebar-nav-icon" />
          Savings
        </NavLink>

        <NavLink
        to='/Invesments'
        className={({ isActive }) =>
          "sidebar-nav-link" + (isActive ? " active" : "")
        }
        >
          <LineChart className="sidebar-nav-icon" />
          Investments
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            "sidebar-nav-link dashboard-logout-btn" + (isActive ? " active" : "")
          }
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
          }}
        >
          <LogOut className="sidebar-nav-icon" />
          Logout
        </NavLink>
      </nav>
      <div className="sidebar-quick-add">
        {/* <h3 className="sidebar-quick-add-title">Quick Add Expense</h3>
        <form className="sidebar-quick-add-form" onSubmit={}>
          <input type="text" placeholder="Description" className="sidebar-input" />
          <input type="number" placeholder="Amount" className="sidebar-input" />
          <button type="submit" className="sidebar-add-btn">Add</button>
        </form> */}
        {/* <AddExpenseForm/> */}
      </div>
    </aside>
  );
};

export default Sidebar;