/**
 * Reusable Button Component
 * 
 * Purpose:
 * Provides a standardized button with multiple visual variants (primary, 
 * destructive, ghost, etc.) and sizes.
 * 
 * How it works:
 * 1. Defines style variants and sizes using Tailwind CSS classes.
 * 2. Uses 'forwardRef' to ensure the component behaves like a native HTML button.
 * 3. Uses the 'cn' utility to merge variant styles with any custom classes.
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      link: 'text-primary underline-offset-4 hover:underline'
    }
    
    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9'
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }