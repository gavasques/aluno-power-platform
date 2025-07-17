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
  const blockedTools = ['eruda', 'vConsole', 'VConsole', '__REACT_DEVTOOLS_GLOBAL_HOOK__'];
  
  blockedTools.forEach(tool => {
    Object.defineProperty(window, tool, {
      get: () => undefined,
      set: () => false,
      configurable: false,
      enumerable: false
    });
  });
  
  // Block script injection patterns used by debugging tools
  const originalAppendChild = Document.prototype.appendChild;
  Document.prototype.appendChild = function(child: Node) {
    if (child instanceof HTMLScriptElement) {
      const src = child.src || '';
      const content = child.textContent || child.innerHTML || '';
      
      if (src.includes('eruda') || 
          content.includes('eruda') || 
          content.includes('localhost:undefined') ||
          content.includes('WebSocket') && content.includes('undefined')) {
        console.warn('🚫 Blocked problematic script injection');
        return child; // Return but don't actually append
      }
    }
    return originalAppendChild.call(this, child);
  };
};

// Initialize all cleanup functions
export const initDevelopmentCleanup = () => {
  if (import.meta.env.DEV) {
    console.log('🧹 Initializing development environment cleanup');
    cleanupConsole();
    blockGlobalPollution();
  }
};