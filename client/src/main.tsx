import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Only log in development environment
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Only log in development environment
  if (import.meta.env.DEV) {
    console.error('Uncaught error:', event.error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
