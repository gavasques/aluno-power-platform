/**
 * USE VIRTUALIZATION HOOK - PERFORMANCE OPTIMIZATION
 * Hook customizado para virtualização de listas grandes
 * 
 * BENEFÍCIOS:
 * - Reduz DOM nodes de 1000+ para ~10
 * - Melhora scroll performance
 * - Reduz memory usage drasticamente
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Items to render outside visible area
  scrollThreshold?: number; // Scroll threshold for updates
}

interface VirtualizationReturn {
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
  totalHeight: number;
  offsetY: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): VirtualizationReturn {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollThreshold = 10
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      startIndex: Math.max(0, visibleStart - overscan),
      endIndex: Math.min(items.length - 1, visibleEnd + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  // Calculate total height and offset
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  const offsetY = useMemo(() => {
    return startIndex * itemHeight;
  }, [startIndex, itemHeight]);

  // Optimized scroll handler
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    
    // Only update if scroll difference is significant
    if (Math.abs(newScrollTop - scrollTop) > scrollThreshold) {
      setScrollTop(newScrollTop);
    }
  }, [scrollTop, scrollThreshold]);

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  };
}

/**
 * USE INTERSECTION OBSERVER - Para lazy loading
 * Hook para detectar elementos visíveis no viewport
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!targetRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(targetRef);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, options]);

  const ref = useCallback((node: HTMLElement | null) => {
    setTargetRef(node);
  }, []);

  return { ref, isIntersecting };
}