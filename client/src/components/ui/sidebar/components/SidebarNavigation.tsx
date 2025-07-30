import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from '../hooks/useSidebar';
import type { 
  SidebarRailProps, 
  SidebarInsetProps, 
  SidebarInputProps, 
  SidebarHeaderProps, 
  SidebarFooterProps, 
  SidebarSeparatorProps, 
  SidebarContentProps 
} from '../types';

export const SidebarRail = memo<SidebarRailProps>(
  React.forwardRef<HTMLButtonElement, SidebarRailProps>(
    ({ className, ...props }, ref) => {
      const { toggleSidebar } = useSidebar();

      return (
        <button
          ref={ref}
          data-sidebar="rail"
          aria-label="Toggle Sidebar"
          tabIndex={-1}
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className={cn(
            "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2 after:bg-sidebar-border after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100 group-data-[collapsible=offcanvas]:translate-x-0 group-data-[side=left]:left-full group-data-[side=right]:right-full",
            "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
            "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
            "group-data-[collapsible=offcanvas]:group-data-[side=left]:border-r group-data-[collapsible=offcanvas]:group-data-[side=right]:border-l",
            "lg:block",
            className
          )}
          {...props}
        />
      );
    }
  )
);

export const SidebarInset = memo<SidebarInsetProps>(
  React.forwardRef<HTMLElement, SidebarInsetProps>(
    ({ className, ...props }, ref) => {
      return (
        <main
          ref={ref}
          className={cn(
            "relative flex min-h-svh flex-1 flex-col bg-background",
            "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
            className
          )}
          {...props}
        />
      );
    }
  )
);

export const SidebarInput = memo<SidebarInputProps>(
  React.forwardRef<HTMLInputElement, SidebarInputProps>(
    ({ className, ...props }, ref) => {
      return (
        <input
          ref={ref}
          data-sidebar="input"
          className={cn(
            "flex h-8 w-full rounded-md border border-sidebar-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      );
    }
  )
);

export const SidebarHeader = memo<SidebarHeaderProps>(
  React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
    ({ className, ...props }, ref) => {
      return (
        <div
          ref={ref}
          data-sidebar="header"
          className={cn("flex flex-col gap-2 p-2", className)}
          {...props}
        />
      );
    }
  )
);

export const SidebarFooter = memo<SidebarFooterProps>(
  React.forwardRef<HTMLDivElement, SidebarFooterProps>(
    ({ className, ...props }, ref) => {
      return (
        <div
          ref={ref}
          data-sidebar="footer"
          className={cn("flex flex-col gap-2 p-2", className)}
          {...props}
        />
      );
    }
  )
);

export const SidebarSeparator = memo<SidebarSeparatorProps>(
  React.forwardRef<HTMLHRElement, SidebarSeparatorProps>(
    ({ className, ...props }, ref) => {
      return (
        <hr
          ref={ref}
          data-sidebar="separator"
          className={cn("mx-2 w-auto border-sidebar-border", className)}
          {...props}
        />
      );
    }
  )
);

export const SidebarContent = memo<SidebarContentProps>(
  React.forwardRef<HTMLDivElement, SidebarContentProps>(
    ({ className, ...props }, ref) => {
      return (
        <div
          ref={ref}
          data-sidebar="content"
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
            className
          )}
          {...props}
        />
      );
    }
  )
);