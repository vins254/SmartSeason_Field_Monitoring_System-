/**
 * SmartSeason User Account Management Form
 * 
 * This component handles the lifecycle of user account data.
 * It is used for both onboarding new team members and updating existing profiles.
 * 
 * Key Logic:
 * 1. Mode Detection: Uses the presence of a 'id' parameter to toggle between CREATE and UPDATE modes.
 * 2. Password Handling: In EDIT mode, the password is optional. If left blank, the existing password is preserved.
 * 3. Role Assignment: Allows assigning 'ADMIN' (Full access) or 'AGENT' (Field access) permissions.
 * 4. Error Feedback: Provides real-time feedback for validation errors (e.g., duplicate emails).
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Configuration State
  const isEditing = !!id
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGENT'
  })

  // Life Cycle: Load existing data if we are in "Edit" mode
  useEffect(() => {
    if (isEditing) {
      loadUser(parseInt(id!))
    }
  }, [id])

  /**
   * loadUser
   * Pulls existing user data from the API to pre-populate the form.
   */
  const loadUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const user = await res.json()
        setFormData({
          name: user.name,
          email: user.email,
          password: '', // We don't fetch the password; it's write-only for security.
          role: user.role.toUpperCase()
        })
      }
    } catch (err) {
      setError('System could not retrieve the requested user profile.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handleSubmit
   * Submits the updated profile or new registration to the server.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      
      /**
       * Dynamic Payload Construction
       * We omit the password if it's empty during an edit, ensuring 
       * we don't accidentally overwrite it with an empty string.
       */
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }
      
      if (formData.password) {
        payload.password = formData.password
      }

      const res = await fetch(isEditing ? `${apiBase}/api/users/${id}` : `${apiBase}/api/users`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Operation failed. Please verify the information.')
      }

      // Return to the roster upon success
      navigate('/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A server error occurred while saving.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">
              {isEditing ? 'Modify Member Profile' : 'Register New Professional'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Manage access and identity records for your team.</p>
          </div>
        </div>

        <Card className="shadow-lg border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-slate-50/50 border-b pb-8">
              <CardTitle className="text-lg">Account Identity</CardTitle>
              <CardDescription className="font-medium">
                {isEditing 
                  ? 'Update security permissions or personal identifiers.' 
                  : 'Establish a new secure identity for an administrator or field agent.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-8">
              {/* Error Notification */}
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium">
                  {error}
                </div>
              )}
              
              {/* Form Input: Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Legal Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Alexander Hamilton"
                  className="h-11 font-medium focus:ring-2 focus:ring-primary/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Form Input: Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Corporate Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. alexander@smartseason.com"
                  className="h-11 font-medium focus:ring-2 focus:ring-primary/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Form Input: Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isEditing ? 'Enter only to change current password' : 'Define a complex access key'}
                  className="h-11 font-medium focus:ring-2 focus:ring-primary/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditing}
                />
                {isEditing && <p className="text-[10px] text-slate-400 italic">Leave empty to preserve existing credentials.</p>}
              </div>

              {/* Form Input: Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform Permissions</Label>
                <select
                  id="role"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-1 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="AGENT">Professional Field Agent (Monitoring Only)</option>
                  <option value="ADMIN">System Administrator (Full Oversight)</option>
                </select>
              </div>
            </CardContent>

            {/* Form Actions */}
            <CardFooter className="flex justify-between border-t p-6 bg-slate-50/30">
              <Button type="button" variant="ghost" className="font-semibold" onClick={() => navigate('/users')}>
                Discard Changes
              </Button>
              <Button type="submit" className="px-8 font-bold shadow-md transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? 'Transmitting...' : (isEditing ? 'Confirm Modifications' : 'Register Account')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
