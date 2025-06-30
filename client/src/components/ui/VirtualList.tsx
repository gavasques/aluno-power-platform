import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized virtual list for common use cases
export const VirtualVideoList = React.memo<{
  videos: any[];
  onVideoSelect?: (video: any) => void;
}>(({ videos, onVideoSelect }) => {
  const renderVideo = useCallback((video: any, index: number) => (
    <div
      key={video.id}
      className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onVideoSelect?.(video)}
    >
      <img
        src={video.thumbnails?.medium?.url}
        alt={video.title}
        className="w-16 h-12 object-cover rounded"
        loading="lazy"
      />
      <div className="flex-1">
        <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(video.publishedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  ), [onVideoSelect]);

  return (
    <VirtualList
      items={videos}
      itemHeight={80}
      containerHeight={400}
      renderItem={renderVideo}
      className="border rounded-lg"
    />
  );
});

VirtualVideoList.displayName = 'VirtualVideoList';

export const VirtualAgentList = React.memo<{
  agents: any[];
  onAgentSelect?: (agent: any) => void;
}>(({ agents, onAgentSelect }) => {
  const renderAgent = useCallback((agent: any, index: number) => (
    <div
      key={agent.id}
      className="p-4 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onAgentSelect?.(agent)}
    >
      <h3 className="font-medium text-sm">{agent.name}</h3>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
        {agent.description}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {agent.category}
        </span>
        <span className="text-xs text-gray-400">
          {agent.status === 'active' ? '✓ Ativo' : '⏸ Inativo'}
        </span>
      </div>
    </div>
  ), [onAgentSelect]);

  return (
    <VirtualList
      items={agents}
      itemHeight={120}
      containerHeight={500}
      renderItem={renderAgent}
      className="border rounded-lg"
    />
  );
});

VirtualAgentList.displayName = 'VirtualAgentList';