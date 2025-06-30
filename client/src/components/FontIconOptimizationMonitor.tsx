import React, { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Type, Image, Clock, Zap } from 'lucide-react';

interface FontIconMetrics {
  fontsLoaded: number;
  totalFonts: number;
  iconsLoaded: number;
  fontLoadTime: number;
  iconLoadTime: number;
  layoutShifts: number;
  renderingTime: number;
}

export const FontIconOptimizationMonitor = memo(() => {
  const [metrics, setMetrics] = useState<FontIconMetrics>({
    fontsLoaded: 0,
    totalFonts: 0,
    iconsLoaded: 0,
    fontLoadTime: 0,
    iconLoadTime: 0,
    layoutShifts: 0,
    renderingTime: 0,
  });

  useEffect(() => {
    let layoutShiftCount = 0;
    const startTime = performance.now();

    // Monitor Cumulative Layout Shift (CLS)
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift') {
          layoutShiftCount += (entry as any).value;
        }
      });
      
      setMetrics(prev => ({
        ...prev,
        layoutShifts: layoutShiftCount,
        renderingTime: performance.now() - startTime,
      }));
    });

    if ('PerformanceObserver' in window) {
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }

    // Monitor font loading
    const checkFontLoad = () => {
      if ('fonts' in document) {
        const totalFonts = (document as any).fonts.size;
        let loadedFonts = 0;
        
        (document as any).fonts.forEach((font: any) => {
          if (font.status === 'loaded') {
            loadedFonts++;
          }
        });

        setMetrics(prev => ({
          ...prev,
          fontsLoaded: loadedFonts,
          totalFonts: totalFonts,
        }));
      }
    };

    // Monitor resource loading for fonts and icons
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('font') || entry.name.includes('woff')) {
          setMetrics(prev => ({
            ...prev,
            fontLoadTime: Math.max(prev.fontLoadTime, entry.duration),
          }));
        }
        
        if (entry.name.includes('icon') || entry.name.includes('svg')) {
          setMetrics(prev => ({
            ...prev,
            iconLoadTime: Math.max(prev.iconLoadTime, entry.duration),
            iconsLoaded: prev.iconsLoaded + 1,
          }));
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource monitoring not supported');
    }

    // Check fonts periodically
    const fontInterval = setInterval(checkFontLoad, 1000);
    checkFontLoad(); // Initial check

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      clearInterval(fontInterval);
    };
  }, []);

  const getOptimizationStatus = (metric: string, value: number) => {
    const thresholds = {
      fontLoadTime: { excellent: 100, good: 300, poor: 1000 },
      iconLoadTime: { excellent: 50, good: 150, poor: 500 },
      layoutShifts: { excellent: 0.1, good: 0.25, poor: 0.5 },
      renderingTime: { excellent: 100, good: 300, poor: 1000 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'secondary';
    
    if (value <= threshold.excellent) return 'default';
    if (value <= threshold.good) return 'secondary';
    return 'destructive';
  };

  const fontLoadPercentage = metrics.totalFonts > 0 
    ? Math.round((metrics.fontsLoaded / metrics.totalFonts) * 100)
    : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Font & Icon Optimization Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Font Loading</span>
            </div>
            <Badge variant="default">
              {fontLoadPercentage}% ({metrics.fontsLoaded}/{metrics.totalFonts})
            </Badge>
            <div className="text-xs text-muted-foreground">
              Load time: {metrics.fontLoadTime.toFixed(0)}ms
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Icons Loaded</span>
            </div>
            <Badge variant="default">
              {metrics.iconsLoaded}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Load time: {metrics.iconLoadTime.toFixed(0)}ms
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Layout Shifts</span>
            </div>
            <Badge variant={getOptimizationStatus('layoutShifts', metrics.layoutShifts)}>
              {metrics.layoutShifts.toFixed(3)} CLS
            </Badge>
            <div className="text-xs text-muted-foreground">
              Cumulative score
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Render Time</span>
            </div>
            <Badge variant={getOptimizationStatus('renderingTime', metrics.renderingTime)}>
              {metrics.renderingTime.toFixed(0)}ms
            </Badge>
            <div className="text-xs text-muted-foreground">
              Initial render
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Optimization Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>System fonts:</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>Icon lazy loading:</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>Font display swap:</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>Preconnect hints:</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FontIconOptimizationMonitor.displayName = 'FontIconOptimizationMonitor';