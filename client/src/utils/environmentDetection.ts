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
  
  // Skip if already protected by early protection
  if ((window as any).__WEBSOCKET_PROTECTED) {
    console.log('🛡️ WebSocket already protected by early protection');
    return;
  }
  
  // Store original WebSocket before any tools can override it
  const OriginalWebSocket = window.WebSocket;
  
  // Create a comprehensive blocking WebSocket
  const BlockingWebSocket = function(url: string | URL, protocols?: string | string[]) {
    const urlString = url.toString();
    
    // Block any WebSocket with problematic patterns
    if (urlString.includes('undefined') || 
        urlString.includes('localhost:undefined') ||
        urlString.includes(':undefined') ||
        urlString.match(/eruda|vconsole|debug/i) ||
        urlString.includes('?token=')) {
      
      // Create a fake WebSocket that fails silently
      const fakeWS = {
        readyState: 3, // CLOSED
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
      };
      
      // Return fake WebSocket instead of throwing
      return fakeWS as WebSocket;
    }
    
    // Allow valid WebSocket connections
    return new OriginalWebSocket(url, protocols);
  } as any;
  
  // Copy static properties
  BlockingWebSocket.CONNECTING = 0;
  BlockingWebSocket.OPEN = 1;
  BlockingWebSocket.CLOSING = 2;
  BlockingWebSocket.CLOSED = 3;
  
  // Replace the global WebSocket only if not already protected
  try {
    Object.defineProperty(window, 'WebSocket', {
      value: BlockingWebSocket,
      writable: false,
      configurable: false
    });
    (window as any).__WEBSOCKET_PROTECTED = true;
  } catch (e) {
    console.warn('⚠️ WebSocket already protected or cannot be redefined');
  }
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