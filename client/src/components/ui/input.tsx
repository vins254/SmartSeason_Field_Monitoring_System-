/**
 * Standard Text Input Component
 * 
 * Purpose:
 * Provides a styled HTML input field that fits the application's design system.
 * 
 * How it works:
 * 1. Wraps the native 'input' element with consistent Tailwind CSS styles 
 *    for focus, borders, and transitions.
 * 2. Uses 'forwardRef' to allow parent components to access the input DOM element directly.
 * 3. Supports all standard HTML input attributes via 'InputHTMLAttributes'.
 */

import { InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }