import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate, getStatusColor, getStageColor } from '@/lib/utils'
import { Plus, Map, Search } from 'lucide-react'

interface Field {
  id: number
  name: string
  cropType: string
  plantingDate: string
  stage: string
  status: string
  agentId: number
  agentName?: string
}

export default function Fields() {
  const { user } = useAuth()
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.cropType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = !stageFilter || field.stage === stageFilter
    const matchesStatus = !statusFilter || field.status === statusFilter
    return matchesSearch && matchesStage && matchesStatus
  })

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">Fields</h1>
            <p className="text-muted-foreground">Manage and monitor your agricultural fields</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/fields/new">
              <Button className="w-full sm:w-auto shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-md border border-input text-sm"
                  />
                </div>
              </div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input text-sm"
              >
                <option value="">All Stages</option>
                <option value="Planted">Planted</option>
                <option value="Growing">Growing</option>
                <option value="Ready">Ready</option>
                <option value="Harvested">Harvested</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input text-sm"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Fields Grid */}
        {filteredFields.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No fields found</p>
              {user?.role === 'admin' && (
                <Link to="/fields/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first field
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFields.map((field) => (
              <Link key={field.id} to={`/fields/${field.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{field.name}</h3>
                          <p className="text-sm text-muted-foreground">{field.cropType}</p>
                        </div>
                        <Badge className={getStatusColor(field.status)}>{field.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={getStageColor(field.stage)}>{field.stage}</Badge>
                        <span className="text-muted-foreground">
                          Planted: {formatDate(field.plantingDate)}
                        </span>
                      </div>
                      {field.agentName && (
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {field.agentName}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}