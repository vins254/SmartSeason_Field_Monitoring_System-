import type { User, Field, FieldUpdate } from './types'

const API_BASE = '/api'

// Auth API
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to get user')
  return res.json()
}

// Fields API
export async function getFields(): Promise<Field[]> {
  const res = await fetch(`${API_BASE}/fields`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to get fields')
  return res.json()
}

export async function getField(id: number): Promise<Field> {
  const res = await fetch(`${API_BASE}/fields/${id}`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to get field')
  return res.json()
}

export async function createField(data: Partial<Field>): Promise<Field> {
  const res = await fetch(`${API_BASE}/fields`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create field')
  return res.json()
}

export async function updateField(id: number, data: Partial<Field>): Promise<Field> {
  const res = await fetch(`${API_BASE}/fields/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update field')
  return res.json()
}

export async function deleteField(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/fields/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to delete field')
}

// Field Updates API
export async function getFieldUpdates(fieldId: number): Promise<FieldUpdate[]> {
  const res = await fetch(`${API_BASE}/fields/${fieldId}/updates`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to get field updates')
  return res.json()
}

export async function createFieldUpdate(fieldId: number, data: { stage: string; notes: string }): Promise<FieldUpdate> {
  const res = await fetch(`${API_BASE}/fields/${fieldId}/updates`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create field update')
  return res.json()
}

// Users API (for admin)
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('smartseason_token')}` 
    }
  })
  if (!res.ok) throw new Error('Failed to get users')
  return res.json()
}