/**
 * SmartSeason Field Detail View
 * 
 * This page provides a deep-dive into a specific agricultural field.
 * It combines static data (metadata) with dynamic data (update history).
 * 
 * Features:
 * 1. Metadata Display: Name, Crop Type, Assigned Agent, etc.
 * 2. Field Management: Admins can edit or delete the field.
 * 3. Operational Workflow: Agents can submit "Stage Updates" with notes.
 * 4. Audit Trail: A complete chronological history of every update made to the field.
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { cn, formatDate, getStatusColor, getStageColor } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react'

interface Field {
  id: number
  name: string
  cropType: string
  plantingDate: string
  stage: string
  status: string
  agentId: number
  agentName?: string
  createdAt: string
  updatedAt: string
}

interface FieldUpdate {
  id: number
  stage: string
  notes: string
  userName?: string
  createdAt: string
}

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Component State
  const [field, setField] = useState<Field | null>(null)
  const [updates, setUpdates] = useState<FieldUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  
  // Form State for new updates
  const [newStage, setNewStage] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch field and its history on component mount or when ID changes
  useEffect(() => {
    if (id) {
      loadField(parseInt(id))
      loadUpdates(parseInt(id))
    }
  }, [id])

  /**
   * loadField
   * Retrieves the core data for this specific field.
   */
  const loadField = async (fieldId: number) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/fields/${fieldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setField(data)
      }
    } catch (error) {
      console.error('Failed to load field:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * loadUpdates
   * Retrieves the chronological history of growth stages and notes.
   */
  const loadUpdates = async (fieldId: number) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/fields/${fieldId}/updates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUpdates(data)
      }
    } catch (error) {
      console.error('Failed to load updates:', error)
    }
  }

  /**
   * handleUpdateStage
   * Submits a new growth report. This updates the field's current stage 
   * and creates a new entry in the audit trail.
   */
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newStage) return

    setIsUpdating(true)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/fields/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage, notes: newNotes })
      })
      if (res.ok) {
        // Refresh the page data after a successful update
        await loadField(parseInt(id))
        await loadUpdates(parseInt(id))
        setShowUpdateForm(false)
        setNewStage('')
        setNewNotes('')
      }
    } catch (error) {
      console.error('Failed to update field:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * handleDelete
   * Permanently removes the field. (Admin only action).
   */
  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this field? This action cannot be undone.')) return

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        navigate('/fields')
      }
    } catch (error) {
      console.error('Failed to delete field:', error)
    }
  }

  // --- RENDERING LOGIC ---

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (!field) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">The requested field could not be found.</p>
          <Link to="/fields">
            <Button variant="link" className="mt-2 font-bold">Back to Directory</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top Header & Action Bar */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link to="/fields">
              <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-slate-100 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary leading-tight">{field.name}</h1>
              <p className="text-lg text-muted-foreground font-semibold italic">{field.cropType}</p>
            </div>
            
            {/* Admin Management Controls */}
            {user?.role === 'admin' && (
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <Link to={`/fields/${field.id}/edit`}>
                  <Button variant="outline" size="sm" className="shadow-sm font-semibold">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDelete} className="shadow-sm font-semibold">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive Field
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section: Core Metadata */}
          <div className="space-y-6">
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-lg">Field Metadata</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Phase</span>
                  <Badge className={getStageColor(field.stage)}>{field.stage}</Badge>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Health Status</span>
                  <Badge className={getStatusColor(field.status)}>{field.status}</Badge>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Planting Cycle Started</span>
                  <span className="font-semibold text-secondary">{formatDate(field.plantingDate)}</span>
                </div>
                {field.agentName && (
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Assigned Professional</span>
                    <span className="font-bold text-primary">{field.agentName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Last Database Sync</span>
                  <span className="text-xs font-medium text-slate-500">{formatDate(field.updatedAt)}</span>
                </div>
              </CardContent>
              
              {/* Agent interaction trigger */}
              {user?.role === 'agent' && (
                <CardFooter className="bg-slate-50/30 border-t">
                  <Button onClick={() => setShowUpdateForm(!showUpdateForm)} className="w-full font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Growth Update
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Section: Submission Form (Hidden by default) */}
            {showUpdateForm && (
              <Card className="shadow-lg border-primary/20 animate-in slide-in-from-top-2 duration-300">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg text-primary">New Growth Report</CardTitle>
                </CardHeader>
                <form onSubmit={handleUpdateStage}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Stage</label>
                      <select
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-md border border-input text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select current stage...</option>
                        <option value="Planted">Planted</option>
                        <option value="Growing">Growing</option>
                        <option value="Ready">Ready</option>
                        <option value="Harvested">Harvested</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Observational Notes</label>
                      <textarea
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Describe crop health, weather conditions, or any concerns..."
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2 bg-slate-50/50 pt-4">
                    <Button type="submit" className="font-bold px-6" disabled={isUpdating}>
                      {isUpdating ? 'Transmitting...' : 'Confirm Update'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowUpdateForm(false)} className="font-semibold">
                      Discard
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>

          {/* Section: Historical Logs */}
          <div className="lg:h-[calc(100vh-250px)] lg:overflow-y-auto pr-2 custom-scrollbar">
            <Card className="shadow-md h-full">
              <CardHeader className="sticky top-0 bg-white z-10 border-b">
                <CardTitle className="text-lg flex items-center justify-between">
                  Activity Log
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">{updates.length} Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {updates.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 font-medium italic">No monitoring logs found for this field.</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
                    {updates.map((update) => (
                      <div key={update.id} className="relative pl-10">
                        {/* Timeline Marker */}
                        <div className="absolute left-0 top-0 mt-1.5 h-10 w-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center -ml-0">
                          <div className={cn("h-3 w-3 rounded-full", getStageColor(update.stage).split(' ')[0].replace('bg-', 'bg-'))}></div>
                        </div>
                        
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={cn(getStageColor(update.stage), "shadow-none font-bold px-3")}>{update.stage}</Badge>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {formatDate(update.createdAt)}
                            </span>
                          </div>
                          
                          {update.notes ? (
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">"{update.notes}"</p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No notes provided for this update.</p>
                          )}
                          
                          {update.userName && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {update.userName.charAt(0)}
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Reported By {update.userName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}