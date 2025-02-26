import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./button"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Extended interface for CardFooter props
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryButtonProps?: React.ComponentProps<typeof Button>;
  secondaryButtonProps?: React.ComponentProps<typeof Button>;
  buttonAlignment?: "start" | "center" | "end" | "between" | "around" | "evenly";
  buttonGap?: "none" | "sm" | "md" | "lg";
}

// Complete CardFooter implementation supporting both approaches
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({
    className,
    children,
    primaryButtonProps,
    secondaryButtonProps,
    buttonAlignment = "center",
    buttonGap = "md",
    ...props
  }, ref) => {
    // Map alignment options to Tailwind classes
    const alignmentClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    };

    // Map gap options to Tailwind classes
    const gapClasses = {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6"
    };

    // Combine alignment and gap classes
    const flexClasses = `flex items-center ${alignmentClasses[buttonAlignment]} ${gapClasses[buttonGap]}`;

    // Determine if we should render internal buttons or use children
    const hasButtonProps = primaryButtonProps || secondaryButtonProps;
    const hasChildren = React.Children.count(children) > 0;

    return (
      <div
        ref={ref}
        className={cn("p-6 pt-0", className)}
        {...props}
      >
        {/* If button props are provided, render internal buttons */}
        {hasButtonProps && (
          <div className={flexClasses}>
            {secondaryButtonProps && (
              <Button
                variant="secondary"
                {...secondaryButtonProps}
              />
            )}
            {primaryButtonProps && (
              <Button
                variant="primary"
                {...primaryButtonProps}
              />
            )}
          </div>
        )}

        {/* If children are provided and no button props, wrap children in flex container */}
        {hasChildren && !hasButtonProps && (
          <div className={flexClasses}>
            {children}
          </div>
        )}

        {/* Edge case: if neither are provided, render nothing */}
        {!hasButtonProps && !hasChildren && null}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardFooterProps
}