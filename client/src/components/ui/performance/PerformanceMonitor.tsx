/**
 * PERFORMANCE MONITOR COMPONENT
 * Componente para monitorar performance em tempo real
 * Usado durante desenvolvimento para identificar problemas
 */

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, HardDrive, Zap } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  domNodes: number;
  rerenderCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children?: React.ReactNode;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = false,
  position = 'top-right',
  children
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    domNodes: 0,
    rerenderCount: 0
  });
  
  const [isVisible, setIsVisible] = useState(enabled);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      frameCountRef.current++;
      
      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        
        setMetrics(prev => ({
          ...prev,
          fps,
          domNodes: document.querySelectorAll('*').length,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          rerenderCount: renderCountRef.current
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      requestAnimationFrame(updateMetrics);
    };

    const animationId = requestAnimationFrame(updateMetrics);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  // Track re-renders
  useEffect(() => {
    renderCountRef.current++;
  });

  if (!enabled || !isVisible) {
    return <>{children}</>;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'bg-green-500';
    if (fps >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      {children}
      
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Card className="w-64 shadow-lg bg-background/95 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Performance Monitor
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                FPS
              </span>
              <Badge className={getFpsColor(metrics.fps)}>
                {metrics.fps}
              </Badge>
            </div>

            {/* Render Time */}
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Render Time
              </span>
              <Badge variant="outline">
                {metrics.renderTime.toFixed(1)}ms
              </Badge>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <HardDrive className="w-3 h-3 mr-1" />
                Memory
              </span>
              <Badge variant="outline">
                {formatMemory(metrics.memoryUsage)}
              </Badge>
            </div>

            {/* DOM Nodes */}
            <div className="flex items-center justify-between">
              <span>DOM Nodes</span>
              <Badge variant="outline">
                {metrics.domNodes.toLocaleString()}
              </Badge>
            </div>

            {/* Re-render Count */}
            <div className="flex items-center justify-between">
              <span>Re-renders</span>
              <Badge variant="outline">
                {metrics.rerenderCount}
              </Badge>
            </div>

            {/* Performance Warnings */}
            {metrics.fps < 30 && (
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700">
                ⚠️ Low FPS detected
              </div>
            )}
            
            {metrics.domNodes > 1500 && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-700">
                ⚠️ High DOM node count
              </div>
            )}
            
            {metrics.memoryUsage > 100 * 1024 * 1024 && (
              <div className="mt-2 p-2 bg-orange-50 rounded text-orange-700">
                ⚠️ High memory usage
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

/**
 * HOC para adicionar monitoramento de performance
 */
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  monitoringEnabled = process.env.NODE_ENV === 'development'
) {
  return React.memo((props: T) => {
    return (
      <PerformanceMonitor enabled={monitoringEnabled}>
        <Component {...props} />
      </PerformanceMonitor>
    );
  });
}

export default PerformanceMonitor;