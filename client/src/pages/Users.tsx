import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, User as UserIcon } from 'lucide-react'

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">User Management</h1>
            <p className="text-muted-foreground">Manage administrative and field agent accounts</p>
          </div>
          <Link to="/users/new">
            <Button className="w-full sm:w-auto shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No users found.
            </div>
          ) : (
            users.map((u) => (
              <Card key={u.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{u.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                    {u.role}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Joined {formatDate(u.createdAt)}
                  </p>
                  {u.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-destructive"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
