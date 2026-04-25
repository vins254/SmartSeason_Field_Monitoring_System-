/**
 * Form Label Component
 * 
 * Purpose:
 * Provides an accessible and styled label for form inputs.
 * 
 * How it works:
 * 1. Wraps the native 'label' element with a consistent font weight and size.
 * 2. Uses 'peer-disabled' styles to ensure labels look deactivated when 
 *    their associated input (the peer) is disabled.
 */

import { LabelHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils'

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }