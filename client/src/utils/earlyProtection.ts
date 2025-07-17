/**
 * Early protection script that runs before any external tools
 * This must be executed as early as possible to prevent tool interference
 */

// Declare global flag for WebSocket protection
declare global {
  interface Window {
    __WEBSOCKET_PROTECTED?: boolean;
  }
}

// Run immediately when script loads, before DOM ready
(function() {
  'use strict';
  
  // Only run in development
  if (typeof window === 'undefined') return;
  
  console.log('🛡️ Early protection initializing...');
  
  // Store original WebSocket immediately
  const OriginalWebSocket = window.WebSocket;
  
  // Block problematic WebSocket creation immediately
  const SafeWebSocket = function(url: string | URL, protocols?: string | string[]) {
    const urlString = url.toString();
    
    // Immediately block any problematic patterns
    if (urlString.includes('undefined') || 
        urlString.includes('localhost:undefined') ||
        urlString.match(/eruda|vconsole|debug/i)) {
      
      // Return a dummy WebSocket that fails silently
      return {
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
      } as WebSocket;
    }
    
    return new OriginalWebSocket(url, protocols);
  } as any;
  
  // Copy static properties
  SafeWebSocket.CONNECTING = 0;
  SafeWebSocket.OPEN = 1;
  SafeWebSocket.CLOSING = 2;
  SafeWebSocket.CLOSED = 3;
  
  // Replace WebSocket only if not already protected
  try {
    if (!window.__WEBSOCKET_PROTECTED) {
      Object.defineProperty(window, 'WebSocket', {
        value: SafeWebSocket,
        writable: false,
        configurable: false
      });
      window.__WEBSOCKET_PROTECTED = true;
      console.log('🛡️ WebSocket protection activated');
    }
  } catch (e) {
    console.warn('⚠️ Could not secure WebSocket:', e);
  }
  
  // Block script loading from problematic sources
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && (value.includes('eruda') || value.includes('vconsole'))) {
          console.warn('🚫 Blocked problematic script:', value);
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  console.log('🛡️ Early protection complete');
})();