import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Menu, 
  X, 
  ChevronDown,
  ChevronUp,
  Wifi,
  Battery,
  Signal
} from "lucide-react";

interface MobileOptimizationProps {
  children: React.ReactNode;
}

export const MobileOptimization: React.FC<MobileOptimizationProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    checkDeviceType();
    checkOrientation();
    handleConnectionChange();

    window.addEventListener('resize', checkDeviceType);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('resize', checkDeviceType);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const getDeviceIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getConnectionBadge = () => {
    if (!isOnline) {
      return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
    }
    
    const getConnectionColor = () => {
      switch (connectionType) {
        case 'slow-2g':
        case '2g':
          return 'bg-red-100 text-red-800';
        case '3g':
          return 'bg-yellow-100 text-yellow-800';
        case '4g':
        case '5g':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    };

    return (
      <Badge className={getConnectionColor()}>
        {connectionType.toUpperCase()}
      </Badge>
    );
  };

  const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isMobile) return <>{children}</>;

    return (
      <div className="mobile-optimized">
        <div className="bg-gray-900 text-white px-4 py-1 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            {getConnectionBadge()}
          </div>
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <span>{orientation}</span>
            <Battery className="h-3 w-3" />
          </div>
        </div>

        <div className="bg-white border-b px-4 py-2 flex justify-between items-center lg:hidden">
          <h1 className="font-semibold text-gray-900">Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Notícias
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Atualizações
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  Hub
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mobile-content">
          {children}
        </div>
      </div>
    );
  };

  return <MobileWrapper>{children}</MobileWrapper>;
};

export const MobileCard: React.FC<{
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}> = ({ title, children, collapsible = false, defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
};

export const MobileGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 2, className = "" }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getGridClass = () => {
    if (isMobile) {
      return "grid grid-cols-1 gap-4";
    }
    
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    };
    
    return `grid ${colsMap[columns]} gap-4`;
  };

  return (
    <div className={`${getGridClass()} ${className}`}>
      {children}
    </div>
  );
};