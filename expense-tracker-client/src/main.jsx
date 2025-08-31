import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Theme initialization (class-based dark mode)
const THEME_STORAGE_KEY = 'theme';
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const effectiveTheme = savedTheme || (prefersDark ? 'dark' : 'light');

if (effectiveTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Expose a global toggle for convenience
window.toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
