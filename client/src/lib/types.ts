/**
 * Global TypeScript Interfaces
 * 
 * Purpose:
 * Defines the "shape" of the data we use in the application. This ensures 
 * that the frontend and backend are always in sync regarding data structures.
 * 
 * How it works:
 * 1. Exports interfaces like 'User', 'Field', and 'FieldUpdate'.
 * 2. Used by components and API services to provide auto-completion and 
 *    catch data-related errors during development.
 */

export interface User {

  id: number
  email: string
  name: string
  role: 'admin' | 'agent'
}

export interface Field {
  id: number
  name: string
  cropType: string
  plantingDate: string
  stage: 'Planted' | 'Growing' | 'Ready' | 'Harvested'
  status: 'Active' | 'At Risk' | 'Completed'
  agentId: number
  agentName?: string
  createdAt: string
  updatedAt: string
}

export interface FieldUpdate {
  id: number
  fieldId: number
  stage: string
  notes: string
  userId: number
  userName?: string
  createdAt: string
}