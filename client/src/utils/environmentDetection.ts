/**
 * Environment detection utility to prevent development tool conflicts
 * Identifies and blocks problematic debugging tools that interfere with application
 */

export const isDevelopment = () => {
  return import.meta.env.DEV;
};

export const isReplit = () => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('replit') || 
          window.location.hostname.includes('riker'));
};

export const hasProblematicExtensions = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for common debugging tools that cause conflicts
  const problematicTools = [
    'eruda', 'vConsole', '__REACT_DEVTOOLS_GLOBAL_HOOK__',
    'chrome', 'webkitURL', '__firefox__'
  ];
  
  return problematicTools.some(tool => 
    typeof (window as any)[tool] !== 'undefined'
  );
};

export const blockProblematicWebSockets = () => {
  if (typeof window === 'undefined' || !isDevelopment()) return;
  
  // Override WebSocket constructor to prevent external tools from creating invalid connections
  const OriginalWebSocket = window.WebSocket;
  
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const urlString = url.toString();
      
      // Block WebSocket connections with undefined ports or suspicious patterns
      if (urlString.includes('localhost:undefined') || 
          urlString.includes(':undefined') ||
          urlString.match(/eruda|vconsole|debug/i)) {
        console.warn('🚫 Blocked problematic WebSocket connection:', urlString);
        throw new Error('WebSocket connection blocked: Invalid URL pattern detected');
      }
      
      super(url, protocols);
    }
  };
};

export const cleanupDevelopmentTools = () => {
  if (typeof window === 'undefined' || !isDevelopment()) return;
  
  // Disable common debugging tools that cause conflicts
  const toolsToDisable = ['eruda', 'vConsole'];
  
  toolsToDisable.forEach(tool => {
    if ((window as any)[tool]) {
      try {
        if (typeof (window as any)[tool].destroy === 'function') {
          (window as any)[tool].destroy();
        }
        delete (window as any)[tool];
        console.log(`🧹 Cleaned up problematic tool: ${tool}`);
      } catch (error) {
        console.warn(`⚠️ Could not clean up ${tool}:`, error);
      }
    }
  });
};

export const initEnvironmentProtection = () => {
  if (isDevelopment()) {
    console.log('🛡️ Initializing development environment protection');
    blockProblematicWebSockets();
    cleanupDevelopmentTools();
  }
};