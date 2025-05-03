// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border border-yellow-400 bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:border-yellow-500 shadow-md hover:shadow-lg focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
        secondary:
          "border border-slate-700 bg-slate-800 text-gray-100 hover:bg-slate-900 hover:border-slate-800 shadow-md hover:shadow-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
        default:
          "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        success:
          "border border-green-500 bg-green-600 text-white hover:bg-green-700 hover:border-green-600 shadow-md hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        outline:
          "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-200 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        link: "text-slate-600 underline-offset-4 hover:underline hover:text-slate-700 focus:ring-2 focus:ring-slate-600 focus:ring-offset-2",
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
