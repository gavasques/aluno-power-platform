import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Standardized Card Variants
 * Replaces 144+ duplicate card styling patterns across the codebase
 * 
 * Common patterns found:
 * - Dashboard cards with stats
 * - Status cards with color coding
 * - Pricing cards with hover effects
 * - Channel cards with action buttons
 * - Product cards with images
 */

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white",
        elevated: "shadow-lg hover:shadow-xl transition-shadow duration-200",
        flat: "shadow-none border-0",
        outlined: "border-2",
        ghost: "border-0 shadow-none bg-transparent",
      },
      size: {
        sm: "p-4",
        default: "p-6", 
        lg: "p-8",
        xl: "p-10",
      },
      status: {
        none: "",
        success: "border-green-200 bg-green-50",
        warning: "border-yellow-200 bg-yellow-50",
        error: "border-red-200 bg-red-50",
        info: "border-blue-200 bg-blue-50",
      },
      interactive: {
        false: "",
        true: "cursor-pointer hover:shadow-md transition-shadow duration-200",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      status: "none",
      interactive: false,
    },
  }
);

export interface CardVariantProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export const CardVariant = React.forwardRef<HTMLDivElement, CardVariantProps>(
  ({ className, variant, size, status, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, status, interactive, className }))}
        {...props}
      />
    );
  }
);
CardVariant.displayName = "CardVariant";

/**
 * Pre-configured card components for common use cases
 */

// Dashboard/Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick
}: StatsCardProps) {
  return (
    <CardVariant 
      variant="default" 
      interactive={!!onClick}
      className={className}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </CardVariant>
  );
}

// Status Card with color coding
interface StatusCardProps {
  title: string;
  children: React.ReactNode;
  status?: "success" | "warning" | "error" | "info";
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function StatusCard({
  title,
  children,
  status = "info",
  icon,
  actions,
  className
}: StatusCardProps) {
  return (
    <CardVariant status={status} className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </CardVariant>
  );
}

// Feature/Pricing Card
interface FeatureCardProps {
  title: string;
  description?: string;
  price?: string;
  features?: string[];
  highlighted?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  price,
  features = [],
  highlighted = false,
  buttonText,
  onButtonClick,
  className
}: FeatureCardProps) {
  return (
    <CardVariant 
      variant={highlighted ? "elevated" : "default"}
      className={cn(
        highlighted && "border-primary ring-2 ring-primary/20",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {price && (
          <div className="text-3xl font-bold">{price}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                {feature}
              </li>
            ))}
          </ul>
        )}
        {buttonText && onButtonClick && (
          <button
            onClick={onButtonClick}
            className={cn(
              "w-full rounded-md px-4 py-2 text-sm font-medium transition-colors",
              highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {buttonText}
          </button>
        )}
      </CardContent>
    </CardVariant>
  );
}

// Product/Item Card
interface ItemCardProps {
  title: string;
  description?: string;
  image?: string;
  price?: string;
  status?: string;
  tags?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ItemCard({
  title,
  description,
  image,
  price,
  status,
  tags = [],
  actions,
  onClick,
  className
}: ItemCardProps) {
  return (
    <CardVariant 
      variant="default"
      interactive={!!onClick}
      className={className}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          {status && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {status}
            </span>
          )}
        </div>
        {description && (
          <CardDescription className="line-clamp-3">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {price && (
            <div className="text-xl font-bold text-primary">{price}</div>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {actions && (
            <div className="flex gap-2 pt-2">{actions}</div>
          )}
        </div>
      </CardContent>
    </CardVariant>
  );
}

// Empty State Card
interface EmptyStateCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyStateCard({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateCardProps) {
  return (
    <CardVariant variant="flat" className={cn("text-center py-12", className)}>
      <CardContent>
        {icon && (
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription className="mb-4 max-w-sm mx-auto">
          {description}
        </CardDescription>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </CardContent>
    </CardVariant>
  );
}

// Grid layout for cards
interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function CardGrid({ 
  children, 
  columns = 3, 
  gap = "md",
  className 
}: CardGridProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-6", 
    lg: "gap-8"
  };

  return (
    <div className={cn(
      "grid grid-cols-1",
      {
        2: "md:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3", 
        4: "md:grid-cols-2 lg:grid-cols-4",
        5: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        6: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      }[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

export {
  cardVariants,
  type CardVariantProps,
};