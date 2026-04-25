/**
 * Shared Frontend Utilities
 * 
 * Purpose:
 * Provides helper functions that are used across the application to keep 
 * our components clean and consistent.
 * 
 * How it works:
 * 1. Defines 'cn' to merge Tailwind classes and resolve conflicts.
 * 2. Provides 'formatDate' for human-readable timestamps.
 * 3. Includes logic-based styling helpers like 'getStatusColor' and 'getStageColor'.
 */


import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn: Class Name Merger
 * Combines Tailwind CSS classes and resolves conflicts (e.g. if you pass two different text colors).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * formatDate: Human-friendly dates
 * Converts raw database timestamps (e.g. 2024-03-25T12:00:00Z) 
 * into readable strings like "Mar 25, 2024".
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * getStatusColor: Logic-based badge styling
 * Maps the field's health status (Active, At Risk, etc.) 
 * to specific Tailwind color schemes.
 */
export function getStatusColor(status: string) {
  const s = status?.toUpperCase()
  switch (s) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
    case 'AT_RISK':
    case 'AT RISK': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'PROBLEM': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * getStageColor: Growth phase badge styling
 * Visual indicators for the crop lifecycle (Planted -> Growing -> Ready -> Harvested).
 */
export function getStageColor(stage: string) {
  const s = stage?.toUpperCase()
  switch (s) {
    case 'PLANTED': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'GROWING': return 'bg-green-100 text-green-800 border-green-200'
    case 'READY': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'HARVESTED': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}