/**
 * Development environment cleanup utility
 * Removes interference from external debugging tools and browser extensions
 */

// Clean up console to reduce noise from external tools
export const cleanupConsole = () => {
  if (!import.meta.env.DEV) return;
  
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Filter out known external tool warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Skip warnings from external debugging tools
    if (message.includes('Unrecognized feature') ||
        message.includes('ambient-light-sensor') ||
        message.includes('battery') ||
        message.includes('execution-while-not-rendered') ||
        message.includes('speaker-selection') ||
        message.includes('publickey-credentials') ||
        message.includes('oversized-images') ||
        message.includes('legacy-image-formats')) {
      return; // Don't log these external tool warnings
    }
    
    originalWarn.apply(console, args);
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Skip errors from external debugging tools
    if (message.includes('eruda.js') ||
        message.includes('Network.js') ||
        message.includes('localhost:undefined') ||
        message.includes('kwift.CHROME.js')) {
      return; // Don't log these external tool errors
    }
    
    originalError.apply(console, args);
  };
};

// Block problematic global pollution
export const blockGlobalPollution = () => {
  if (!import.meta.env.DEV) return;
  
  // Prevent external tools from polluting window object
  Object.defineProperty(window, 'eruda', {
    get: () => undefined,
    set: () => false,
    configurable: false
  });
  
  Object.defineProperty(window, 'vConsole', {
    get: () => undefined,
    set: () => false,
    configurable: false
  });
};

// Initialize all cleanup functions
export const initDevelopmentCleanup = () => {
  if (import.meta.env.DEV) {
    console.log('🧹 Initializing development environment cleanup');
    cleanupConsole();
    blockGlobalPollution();
  }
};