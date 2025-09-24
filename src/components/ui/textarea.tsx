// components/ui/textarea.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { TextareaProps } from "@/lib/types"

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-surface-secondary px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "dark:bg-surface-secondary dark:text-foreground dark:border-input",
          "dark:focus-visible:ring-focus-ring dark:focus-visible:ring-offset-1 dark:focus-visible:border-transparent",
          "dark:placeholder:text-secondary",
          error && "border-destructive focus-visible:ring-destructive/50 dark:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }