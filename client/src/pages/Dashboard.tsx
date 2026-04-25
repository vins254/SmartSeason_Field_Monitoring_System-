import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate, getStageColor } from '@/lib/utils'
import { Map, Sprout, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

interface Field {
  id: number
  name: string
  cropType: string
  stage: string
  status: string
  agentName?: string
  updatedAt: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = async () => {
    try {
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch('/api/fields', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setFields(data)
      }
    } catch (error) {
      console.error('Failed to load fields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    total: fields.length,
    active: fields.filter(f => f.status === 'Active').length,
    atRisk: fields.filter(f => f.status === 'At Risk').length,
    completed: fields.filter(f => f.status === 'Completed').length,
  }

  const stageCounts = {
    planted: fields.filter(f => f.stage === 'Planted').length,
    growing: fields.filter(f => f.stage === 'Growing').length,
    ready: fields.filter(f => f.stage === 'Ready').length,
    harvested: fields.filter(f => f.stage === 'Harvested').length,
  }

  const recentFields = [...fields]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's what's happening with your fields.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Fields</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.atRisk}</p>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="capitalize">{stage}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {recentFields.length === 0 ? (
                <p className="text-muted-foreground text-sm">No fields yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentFields.map((field) => (
                    <Link
                      key={field.id}
                      to={`/fields/${field.id}`}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <p className="text-xs text-muted-foreground">{field.cropType}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStageColor(field.stage)}>{field.stage}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(field.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}