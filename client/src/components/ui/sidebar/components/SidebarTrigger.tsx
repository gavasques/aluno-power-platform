import React, { memo } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from '../hooks/useSidebar';
import type { SidebarTriggerProps } from '../types';

export const SidebarTrigger = memo<SidebarTriggerProps>(
  React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
    ({ className, onClick, ...props }, ref) => {
      const { toggleSidebar } = useSidebar();

      return (
        <Button
          ref={ref}
          data-sidebar="trigger"
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", className)}
          onClick={(event) => {
            onClick?.(event);
            toggleSidebar();
          }}
          {...props}
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      );
    }
  )
);