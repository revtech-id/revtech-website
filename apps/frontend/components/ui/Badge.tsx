import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-gray-100 text-gray-900",
        destructive:
          "bg-red-100 text-red-600",
        outline:
          "text-gray-900 border border-gray-200",
        success:
          "bg-green-100 text-green-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

function Badge({ className, variant, showDot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            variant === "default" && "bg-primary",
            variant === "secondary" && "bg-gray-500",
            variant === "destructive" && "bg-red-500",
            variant === "success" && "bg-green-500",
            variant === "outline" && "bg-gray-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
