import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from '../hooks/useSidebar';
import type { SidebarProps } from '../types';

export const Sidebar = memo<SidebarProps>(
  React.forwardRef<HTMLDivElement, SidebarProps>(
    ({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
      const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

      if (collapsible === "none") {
        return (
          <div
            className={cn(
              "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        );
      }

      if (isMobile) {
        return (
          <>
            {/* Mobile backdrop */}
            {openMobile && (
              <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setOpenMobile(false)}
              />
            )}
            
            {/* Mobile sidebar */}
            <div
              ref={ref}
              data-sidebar="sidebar"
              data-variant={variant}
              data-state={openMobile ? "open" : "closed"}
              className={cn(
                "fixed inset-y-0 z-50 flex h-svh w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out",
                side === "left" && openMobile ? "translate-x-0" : side === "left" ? "-translate-x-full" : "",
                side === "right" && openMobile ? "translate-x-0" : side === "right" ? "translate-x-full" : "",
                side === "left" ? "left-0" : "right-0",
                className
              )}
              {...props}
            >
              {children}
            </div>
          </>
        );
      }

      return (
        <div
          ref={ref}
          data-sidebar="sidebar"
          data-variant={variant}
          data-state={state}
          data-collapsible={state === "collapsed" ? collapsible : ""}
          className={cn(
            "relative flex h-svh w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
            "group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
            collapsible === "offcanvas" && "group-data-[collapsible=offcanvas]:w-0",
            collapsible === "icon" && "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }
  )
);