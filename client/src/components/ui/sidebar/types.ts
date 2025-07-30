import React from 'react';

export interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface SidebarProps {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  className?: string;
  children?: React.ReactNode;
}

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface SidebarTriggerProps extends React.ComponentProps<"button"> {
  className?: string;
}

export interface SidebarRailProps extends React.ComponentProps<"button"> {
  className?: string;
}

export interface SidebarInsetProps extends React.ComponentProps<"main"> {
  className?: string;
}

export interface SidebarInputProps extends React.ComponentProps<"input"> {
  className?: string;
}

export interface SidebarHeaderProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarFooterProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarSeparatorProps extends React.ComponentProps<"hr"> {
  className?: string;
}

export interface SidebarContentProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarGroupProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  className?: string;
}

export interface SidebarGroupActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  className?: string;
}

export interface SidebarGroupContentProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarMenuProps extends React.ComponentProps<"ul"> {
  className?: string;
}

export interface SidebarMenuItemProps extends React.ComponentProps<"li"> {
  className?: string;
}

export interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  tooltip?: string | React.ComponentProps<"div">;
}

export interface SidebarMenuActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  showOnHover?: boolean;
  className?: string;
}

export interface SidebarMenuBadgeProps extends React.ComponentProps<"div"> {
  className?: string;
}

export interface SidebarMenuSkeletonProps extends React.ComponentProps<"div"> {
  className?: string;
  showIcon?: boolean;
}

export interface SidebarMenuSubProps extends React.ComponentProps<"ul"> {
  className?: string;
}

export interface SidebarMenuSubItemProps extends React.ComponentProps<"li"> {
  className?: string;
}

export interface SidebarMenuSubButtonProps extends React.ComponentProps<"a"> {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
  className?: string;
}