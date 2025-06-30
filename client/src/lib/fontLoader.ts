// Optimized font loading system
export class FontLoader {
  private static instance: FontLoader;
  private loadedFonts = new Set<string>();
  private fontPromises = new Map<string, Promise<void>>();

  private constructor() {}

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  // Critical fonts for immediate loading
  private criticalFonts = {
    system: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fallback: 'sans-serif',
      critical: true
    }
  };

  // Optional fonts for enhanced experience
  private optionalFonts = {
    inter: {
      family: 'Inter',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      fallback: 'sans-serif',
      critical: false
    },
    sourceCodePro: {
      family: 'Source Code Pro',
      url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap',
      fallback: 'monospace',
      critical: false
    }
  };

  // Load font with proper error handling and fallbacks
  async loadFont(fontName: string): Promise<void> {
    if (this.loadedFonts.has(fontName)) {
      return Promise.resolve();
    }

    if (this.fontPromises.has(fontName)) {
      return this.fontPromises.get(fontName)!;
    }

    const font = this.optionalFonts[fontName as keyof typeof this.optionalFonts];
    if (!font) {
      console.warn(`Font ${fontName} not found in registry`);
      return Promise.resolve();
    }

    const loadPromise = this.loadFontFromUrl(font.url, fontName);
    this.fontPromises.set(fontName, loadPromise);
    
    return loadPromise;
  }

  private async loadFontFromUrl(url: string, fontName: string): Promise<void> {
    try {
      // Create link element for font loading
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.crossOrigin = 'anonymous';

      // Promise-based font loading
      const loadPromise = new Promise<void>((resolve, reject) => {
        link.onload = () => {
          this.loadedFonts.add(fontName);
          resolve();
        };
        link.onerror = () => {
          console.warn(`Failed to load font: ${fontName}`);
          reject(new Error(`Font load failed: ${fontName}`));
        };
      });

      // Add to document head
      document.head.appendChild(link);
      
      // Wait for font load with timeout
      await Promise.race([
        loadPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font load timeout')), 3000)
        )
      ]);

    } catch (error) {
      console.warn(`Font loading error for ${fontName}:`, error);
      // Don't throw - graceful degradation to fallback fonts
    }
  }

  // Preload critical fonts
  preloadCriticalFonts(): void {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback for non-blocking font loading
    const loadFonts = () => {
      Object.entries(this.optionalFonts).forEach(([name, font]) => {
        if (font.critical) {
          this.loadFont(name);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadFonts);
    } else {
      setTimeout(loadFonts, 100);
    }
  }

  // Load fonts based on route priority
  loadRouteSpecificFonts(route: string): void {
    const routeFontMap: Record<string, string[]> = {
      '/admin': ['inter'],
      '/agents': ['inter'],
      '/code': ['sourceCodePro'],
      // Add more route-specific font mappings
    };

    const fontsToLoad = routeFontMap[route] || [];
    fontsToLoad.forEach(font => this.loadFont(font));
  }

  // Check if font is loaded
  isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }

  // Get font family with fallbacks
  getFontFamily(fontName: string): string {
    const font = this.optionalFonts[fontName as keyof typeof this.optionalFonts] || 
                 this.criticalFonts[fontName as keyof typeof this.criticalFonts];
    
    if (!font) {
      return this.criticalFonts.system.family;
    }

    return this.loadedFonts.has(fontName) 
      ? `${font.family}, ${font.fallback}`
      : font.fallback;
  }
}

// Font loading hook
export const useFontLoader = () => {
  const fontLoader = FontLoader.getInstance();

  React.useEffect(() => {
    fontLoader.preloadCriticalFonts();
  }, [fontLoader]);

  return {
    loadFont: fontLoader.loadFont.bind(fontLoader),
    isFontLoaded: fontLoader.isFontLoaded.bind(fontLoader),
    getFontFamily: fontLoader.getFontFamily.bind(fontLoader),
    loadRouteSpecificFonts: fontLoader.loadRouteSpecificFonts.bind(fontLoader),
  };
};

// React integration
import React from 'react';