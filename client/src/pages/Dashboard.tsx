/**
 * SmartSeason Administrator Dashboard
 * 
 * This page provides a high-level overview of all agricultural operations.
 * It calculates real-time statistics and shows recent field updates at a glance.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate, getStageColor } from '@/lib/utils'
import { Map, Sprout, AlertTriangle, CheckCircle, TrendingUp, Plus } from 'lucide-react'

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

  // On mount, we fetch the field data from our API
  useEffect(() => {
    loadFields()
  }, [])

  /**
   * Fetch all fields that the current user is authorized to see.
   * We use the JWT token from localStorage to authenticate the request.
   */
  const loadFields = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      
      const res = await fetch(`${apiBase}/api/fields`, {
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

  // --- STATS CALCULATIONS ---
  
  // We calculate these on the fly so they are always accurate to the loaded data.
  const stats = {
    total: fields.length,
    active: fields.filter(f => f.status === 'Active').length,
    atRisk: fields.filter(f => f.status === 'At Risk').length,
    completed: fields.filter(f => f.status === 'Completed').length,
  }

  // Break down fields by their growth stage for the distribution chart
  const stageCounts = {
    planted: fields.filter(f => f.stage === 'Planted').length,
    growing: fields.filter(f => f.stage === 'Growing').length,
    ready: fields.filter(f => f.stage === 'Ready').length,
    harvested: fields.filter(f => f.stage === 'Harvested').length,
  }

  // Sort by updatedAt to show the most recent activity first
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
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground font-medium">Seasonal overview of field activities and crop progress.</p>
          </div>
          {/* Only Admins can create new fields */}
          {user?.role === 'admin' && (
            <Link to="/fields/new">
              <Button className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </Link>
          )}
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Fields</p>
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
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-green-700">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.atRisk}</p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-yellow-700">At Risk</p>
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
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="capitalize font-medium text-sm">{stage}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 sm:w-48 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-6">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Field Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {recentFields.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center italic">No monitoring activities recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentFields.map((field) => (
                    <Link
                      key={field.id}
                      to={`/fields/${field.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-secondary/30 transition-all duration-200"
                    >
                      <div>
                        <p className="font-semibold text-secondary">{field.name}</p>
                        <p className="text-xs text-muted-foreground">{field.cropType}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStageColor(field.stage)} shadow-sm`}>{field.stage}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                          Last Updated: {formatDate(field.updatedAt)}
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