import type { Tool as DbTool } from '@shared/schema';

export interface ToolHeaderProps {
  tool: DbTool;
  toolType: { name: string } | undefined;
}

export interface ToolTabsProps {
  tool: DbTool;
  hasVideos: boolean;
  user: any;
  isAdmin: boolean;
}

export interface ToolInfoCardProps {
  tool: DbTool;
  toolType: { name: string } | undefined;
}

export interface ToolNavigationProps {
  onBack: () => void;
}