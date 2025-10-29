// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-state focus-visible-state",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:border-primary/90 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:bg-primary dark:text-primary-foreground dark:border-primary/80 dark:hover:bg-primary/90 dark:focus:ring-primary/70 dark:focus:ring-offset-background",
        secondary:
          "bg-secondary text-white border border-secondary hover:bg-secondary/80 hover:border-secondary/80 shadow-md hover:shadow-lg focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 dark:bg-secondary dark:text-text-primary dark:border-panel-border dark:hover:bg-secondary/60 dark:focus:ring-secondary/70 dark:focus:ring-offset-background",
        default:
          "bg-surface-secondary border border-border text-foreground hover:bg-surface-tertiary hover:border-border shadow-sm hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-surface-secondary dark:text-text-primary dark:border-panel-border dark:hover:bg-surface-tertiary dark:focus:ring-offset-background",
        success:
          "border border-green-500 bg-green-600 text-white hover:bg-green-700 hover:border-green-600 shadow-md hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-form-success/70 dark:bg-form-success dark:text-text-inverted dark:hover:bg-form-success/90 dark:hover:border-form-success/60 dark:focus:ring-form-success/50 dark:focus:ring-offset-background",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2 dark:bg-form-error dark:text-text-inverted dark:border-form-error/80 dark:hover:bg-form-error/80 dark:focus:ring-form-error/70 dark:focus:ring-offset-background",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-secondary hover:text-foreground shadow-sm hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:border-panel-border dark:text-text-primary dark:bg-transparent dark:hover:bg-interactive-hover dark:focus:ring-offset-background",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-secondary hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-transparent dark:text-text-primary dark:hover:bg-interactive-hover dark:focus:ring-offset-background",
        link: 
          "text-foreground/80 underline-offset-4 hover:underline hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:text-text-primary/90 dark:hover:text-text-primary dark:focus:ring-offset-background",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[3px]",
        md: "h-10 px-8 text-md rounded-[5px]",
        lg: "h-14 px-10 text-lg rounded-[6px]",
        xl: "h-16 px-12 text-xl rounded-[8px]",
        xxl: "h-18 px-12 text-2xl rounded-[10px]",
        default: "h-9 px-4 text-md rounded-[6px]",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
