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