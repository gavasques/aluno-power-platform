import { LucideIcon } from "lucide-react";

interface AIPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: boolean;
}

export const AIPageHeader = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient = false 
}: AIPageHeaderProps) => (
  <div className="text-center space-y-4 mb-8">
    <div className="flex items-center justify-center gap-3">
      {gradient ? (
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
          <Icon className="h-8 w-8 text-white" />
        </div>
      ) : (
        <Icon className="h-8 w-8 text-purple-600" />
      )}
      <h1 className={`text-3xl font-bold ${
        gradient 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
          : 'flex items-center gap-2'
      }`}>
        {title}
      </h1>
    </div>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      {description}
    </p>
  </div>
);