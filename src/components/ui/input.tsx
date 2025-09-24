import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-surface-secondary px-3 py-1 text-base shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "dark:bg-surface-secondary dark:text-foreground dark:border-input",
          "dark:focus-visible:ring-focus-ring dark:focus-visible:border-transparent",
          "dark:placeholder:text-secondary",
          error && "border-destructive focus-visible:ring-destructive/50 dark:border-destructive",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
