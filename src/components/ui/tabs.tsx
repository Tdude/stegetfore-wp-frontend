"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Support both horizontal and vertical layouts
      "inline-flex h-9 items-center justify-center rounded-lg p-1 text-muted-foreground",
      // If vertical, stack tabs and adjust width
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-auto data-[orientation=vertical]:items-stretch",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Horizontal & vertical: same border, color, and active/inactive logic
      "relative inline-flex items-center justify-center whitespace-pre-line break-words px-4 py-2 text-base font-medium border-b-2 border-gray-200",
      "transition-colors duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent",
      "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground hover:text-primary hover:border-primary",
      "rounded-t-md",
      // Vertical: add right border, keep all other styling the same as horizontal
      "data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:rounded-t-none data-[orientation=vertical]:bg-transparent data-[orientation=vertical]:max-w-[200px] data-[orientation=vertical]:min-h-[48px]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Fade in/out transition for tab content
      "transition-opacity duration-400",
      "opacity-0 data-[state=active]:opacity-100",
      "pointer-events-none data-[state=active]:pointer-events-auto",
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }