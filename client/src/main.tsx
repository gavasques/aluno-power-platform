console.log('🚨 main.tsx: File loaded - very first line');

import { createRoot } from 'react-dom/client'
console.log('🚨 main.tsx: createRoot imported');

import App from './App.tsx'
console.log('🚨 main.tsx: App imported');

import './index.css'
console.log('🚨 main.tsx: index.css imported');

import { initEnvironmentProtection } from './utils/environmentDetection'
console.log('🚨 main.tsx: initEnvironmentProtection imported');

import { initDevelopmentCleanup } from './utils/developmentCleanup'
console.log('🚨 main.tsx: initDevelopmentCleanup imported');

console.log('🚨 main.tsx: All imports complete, calling init functions...');

// Initialize environment protection and cleanup before anything else
initEnvironmentProtection();
console.log('🚨 main.tsx: initEnvironmentProtection called');

initDevelopmentCleanup();
console.log('🚨 main.tsx: initDevelopmentCleanup called');

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

console.log('🚀 Starting React app initialization...');
const rootElement = document.getElementById("root");
console.log('🎯 Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ CRITICAL: Root element not found in DOM!');
} else {
  console.log('📦 Creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created successfully');
    
    console.log('🎨 Rendering App component...');
    root.render(<App />);
    console.log('✅ App component render called');
  } catch (error) {
    console.error('❌ Error during React initialization:', error);
  }
}
