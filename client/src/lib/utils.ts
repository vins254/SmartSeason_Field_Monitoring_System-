import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export function getStatusColor(status: string) {
  const s = status?.toUpperCase()
  switch (s) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'AT_RISK':
    case 'AT RISK': return 'bg-red-100 text-red-800'
    case 'COMPLETED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStageColor(stage: string) {
  const s = stage?.toUpperCase()
  switch (s) {
    case 'PLANTED': return 'bg-blue-100 text-blue-800'
    case 'GROWING': return 'bg-green-100 text-green-800'
    case 'READY': return 'bg-yellow-100 text-yellow-800'
    case 'HARVESTED': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}