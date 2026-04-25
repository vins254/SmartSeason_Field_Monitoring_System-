/**
 * SmartSeason Login Page
 * 
 * This is the entry point for all users. It handles authentication 
 * by communicating with our Node.js backend.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/App'
import { Sprout } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Handle the form submission
   * We send the credentials to the backend, and if successful, we save the 
   * session and redirect the user to the dashboard.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Get the API base URL from environment variables
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!res.ok) {
        // If the backend returns an error (like 401 Unauthorized), 
        // we extract the message and show it to the user.
        const data = await res.json()
        throw new Error(data.message || 'Invalid credentials')
      }
      
      const data = await res.json()
      
      // Store the JWT token for future API requests
      localStorage.setItem('smartseason_token', data.token)
      
      // Update the global auth state
      await login(email, password)
      
      // Welcome home!
      navigate('/dashboard')
    } catch (err) {
      // Catch network errors or invalid credential errors
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SmartSeason</CardTitle>
          <CardDescription>Field Monitoring System</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Message Alert */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@smartseason.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full py-6 text-lg font-medium transition-all hover:scale-[1.02]" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}