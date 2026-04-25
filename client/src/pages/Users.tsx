/**
 * SmartSeason User Directory & Management
 * 
 * This page is the "HR Hub" for the application. It allows Administrators 
 * to oversee the entire team of Admins and Field Agents.
 * 
 * Features:
 * 1. Team Roster: Displays all user accounts with their roles and join dates.
 * 2. CRUD Operations: Create, Edit, and Delete user accounts.
 * 3. Safety Check: Prevents the current user from deleting their own account.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, User as UserIcon, Pencil } from 'lucide-react'

interface User {
  id: number
  email: string
  name: string
  role: string
  createdAt: string
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  /**
   * loadUsers
   * Fetches the complete list of accounts from the backend.
   */
  const loadUsers = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handleDelete
   * Removes a user from the system. 
   * Includes a confirmation prompt to prevent accidental deletions.
   */
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently remove this user account? This action will revoke their access immediately.')) return

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        // Optimistic UI update: remove the user from the list without a full refresh
        setUsers(users.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">Team Directory</h1>
            <p className="text-muted-foreground">Oversee administrative and professional field agent accounts.</p>
          </div>
          <Link to="/users/new">
            <Button className="w-full sm:w-auto shadow-sm font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Register New Member
            </Button>
          </Link>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50 border border-dashed rounded-xl">
              <p className="text-slate-400 font-medium">No team members registered yet.</p>
            </div>
          ) : (
            users.map((u) => (
              <Card key={u.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Placeholder */}
                    <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-secondary">{u.name}</CardTitle>
                      <p className="text-[11px] font-medium text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="uppercase text-[9px] font-bold tracking-widest">
                    {u.role}
                  </Badge>
                </CardHeader>
                
                <CardContent className="pt-4 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Since {formatDate(u.createdAt)}
                  </p>
                  
                  {/* Row Actions */}
                  <div className="flex items-center gap-1">
                    <Link to={`/users/${u.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-primary transition-colors h-8 w-8"
                        title="Edit Profile"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {/* Security: Don't let users delete themselves to avoid lockout */}
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-destructive transition-colors h-8 w-8"
                        onClick={() => handleDelete(u.id)}
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
