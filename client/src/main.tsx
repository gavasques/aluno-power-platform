import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initEnvironmentProtection } from './utils/environmentDetection'
import { initDevelopmentCleanup } from './utils/developmentCleanup'

// Initialize environment protection and cleanup before anything else
initEnvironmentProtection();
initDevelopmentCleanup();

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Filter out external tool errors and only log application errors
  const message = event.reason?.message || String(event.reason);
  
  if (message.includes('localhost:undefined') ||
      message.includes('eruda') ||
      message.includes('WebSocket') && message.includes('invalid')) {
    event.preventDefault();
    return; // Don't log external tool errors
  }
  
  // Only log actual application errors in development
  if (import.meta.env.DEV) {
    console.error('Application error (unhandled rejection):', event.reason);
  }
  event.preventDefault();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Filter out external tool errors
  const message = event.message || event.error?.message || '';
  
  if (message.includes('localhost:undefined') ||
      message.includes('eruda') ||
      message.includes('kwift.CHROME.js')) {
    return; // Don't log external tool errors
  }
  
  // Only log actual application errors in development
  if (import.meta.env.DEV) {
    console.error('Application error (uncaught):', event.error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
