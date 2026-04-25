/**
 * SmartSeason Fields Directory
 * 
 * This page displays a comprehensive list of all agricultural monitoring targets.
 * Features:
 * 1. Global Search (by name or crop type).
 * 2. Status & Stage filtering.
 * 3. Responsive grid layout for field cards.
 * 4. Conditional "Add Field" button (Admin only).
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { cn, formatDate, getStatusColor, getStageColor } from '@/lib/utils'
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
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadFields()
  }, [])

  /**
   * Fetch field data from the API
   * Note: The API automatically handles filtering based on the user's role 
   * (Admins see all, Agents see assigned only).
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

  /**
   * Client-side search and filter logic
   * We combine all filters into a single computed array for efficiency.
   */
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
        {/* Header with Page Title and CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">Monitoring Fields</h1>
            <p className="text-muted-foreground">Detailed directory of active agricultural assets.</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/fields/new">
              <Button className="w-full sm:w-auto shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Field
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {/* Search Bar */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or crop..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-md border border-input text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* Stage Filter */}
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input text-sm bg-background font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Growth Stages</option>
                <option value="Planted">Planted</option>
                <option value="Growing">Growing</option>
                <option value="Ready">Ready</option>
                <option value="Harvested">Harvested</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input text-sm bg-background font-medium outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Health Status</option>
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid View */}
        {filteredFields.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No fields match your current filters.</p>
              {user?.role === 'admin' && searchTerm === '' && (
                <Link to="/fields/new">
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Register a new field
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFields.map((field) => (
              <Link key={field.id} to={`/fields/${field.id}`} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden border-slate-200">
                  <CardContent className="p-0">
                    <div className="p-6 space-y-4">
                      {/* Card Header: Name & Health Status */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-secondary text-lg group-hover:text-primary transition-colors line-clamp-1">{field.name}</h3>
                          <p className="text-sm font-medium text-muted-foreground">{field.cropType}</p>
                        </div>
                        <Badge className={cn(getStatusColor(field.status), "shadow-none border")}>
                          {field.status}
                        </Badge>
                      </div>

                      {/* Card Body: Stage & Timeline */}
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={cn(getStageColor(field.stage), "shadow-none border")}>
                          {field.stage}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">
                          Since {formatDate(field.plantingDate)}
                        </span>
                      </div>
                      
                      {/* Card Footer: Assignment Info */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Assigned Professional
                        </p>
                        <p className="text-sm font-semibold text-secondary mt-0.5">
                          {field.agentName || "Unassigned"}
                        </p>
                      </div>
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