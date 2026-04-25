/**
 * SmartSeason Frontend Main Application
 * 
 * This is the "brain" of our frontend. It manages:
 * 1. Global Authentication State (Are you logged in?)
 * 2. Route Protection (Can you see this page?)
 * 3. Navigation & Routing (Where are you going?)
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Fields from './pages/Fields' 
import FieldDetail from './pages/FieldDetail'
import FieldForm from './pages/FieldForm'
import Users from './pages/Users'
import UserForm from './pages/UserForm'

// --- AUTHENTICATION CONTEXT ---

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'agent'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

/**
 * AuthContext allows us to share user data across every component 
 * without having to pass props down manually through 10 levels of components.
 */
const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// --- PROTECTED ROUTE WRAPPER ---

/**
 * The ProtectedRoute component is our "security guard".
 * It checks if a user is logged in before allowing them to see a page.
 * If they aren't logged in, it redirects them to the Login page.
 */
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'agent' }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    // Show a loading spinner while we check the local storage for an existing session
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    // No user found? Send them to the login gate.
    return <Navigate to="/login" replace />
  }
  
  // Rule: Only Admins can access certain management pages.
  // Agents get bounced back to the dashboard if they try to sneak in.
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// --- AUTH PROVIDER ---

/**
 * AuthProvider handles the heavy lifting of:
 * - Persisting login across refreshes (using localStorage)
 * - Communicating with the Login API
 * - Managing the global 'user' state
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // When the app first loads, we check if there's a user saved in local storage.
    // This is what makes "Remember Me" functionality work.
    const stored = localStorage.getItem('smartseason_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        // If the data is corrupted, just clear it.
        localStorage.removeItem('smartseason_user')
      }
    }
    setIsLoading(false)
  }, [])


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!res.ok) return false
      
      const data = await res.json()
      const userData = { ...data.user }
      
      // Save user info and token so the user stays logged in if they refresh.
      setUser(userData)
      localStorage.setItem('smartseason_user', JSON.stringify(userData))
      localStorage.setItem('smartseason_token', data.token)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartseason_user')
    localStorage.removeItem('smartseason_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// --- MAIN APPLICATION ---

/**
 * The App component defines our URL structure.
 * We use 'react-router-dom' to map paths (like /fields) to specific pages.
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Require Login) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/fields" element={
          <ProtectedRoute>
            <Fields />
          </ProtectedRoute>
        } />
        
        <Route path="/fields/new" element={
          <ProtectedRoute requiredRole="admin">
            <FieldForm />
          </ProtectedRoute>
        } />
        
        <Route path="/fields/:id" element={
          <ProtectedRoute>
            <FieldDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/fields/:id/edit" element={
          <ProtectedRoute requiredRole="admin">
            <FieldForm />
          </ProtectedRoute>
        } />
        
        {/* User Management (Admin Only) */}
        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/users/new" element={
          <ProtectedRoute requiredRole="admin">
            <UserForm />
          </ProtectedRoute>
        } />
        
        <Route path="/users/:id/edit" element={
          <ProtectedRoute requiredRole="admin">
            <UserForm />
          </ProtectedRoute>
        } />
        
        {/* The "Catch-all" Redirect: If the URL doesn't match anything, go to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App