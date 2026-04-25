import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/App'
import { formatDate, getStatusColor, getStageColor } from '@/lib/utils'
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
  const [field, setField] = useState<Field | null>(null)
  const [updates, setUpdates] = useState<FieldUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [newStage, setNewStage] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      loadField(parseInt(id))
      loadUpdates(parseInt(id))
    }
  }, [id])

  const loadField = async (fieldId: number) => {
    try {
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`/api/fields/${fieldId}`, {
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

  const loadUpdates = async (fieldId: number) => {
    try {
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`/api/fields/${fieldId}/updates`, {
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

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newStage) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`/api/fields/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage, notes: newNotes })
      })
      if (res.ok) {
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

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this field?')) return

    try {
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`/api/fields/${id}`, {
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
          <p className="text-muted-foreground">Field not found</p>
          <Link to="/fields">
            <Button variant="link" className="mt-2">Back to Fields</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link to="/fields">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary">{field.name}</h1>
              <p className="text-lg text-muted-foreground font-medium">{field.cropType}</p>
            </div>
            {user?.role === 'admin' && (
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <Link to={`/fields/${field.id}/edit`}>
                  <Button variant="outline" size="sm" className="shadow-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDelete} className="shadow-sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Details */}
          <Card>
            <CardHeader>
              <CardTitle>Field Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stage</span>
                <Badge className={getStageColor(field.stage)}>{field.stage}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(field.status)}>{field.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planting Date</span>
                <span>{formatDate(field.plantingDate)}</span>
              </div>
              {field.agentName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To</span>
                  <span>{field.agentName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(field.updatedAt)}</span>
              </div>
            </CardContent>
            {user?.role === 'agent' && (
              <CardFooter>
                <Button onClick={() => setShowUpdateForm(!showUpdateForm)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Update Stage
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Update Form */}
          {showUpdateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Update Field Stage</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateStage}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Stage</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      required
                      className="w-full h-9 px-3 rounded-md border border-input text-sm"
                    >
                      <option value="">Select stage</option>
                      <option value="Planted">Planted</option>
                      <option value="Growing">Growing</option>
                      <option value="Ready">Ready</option>
                      <option value="Harvested">Harvested</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Add any observations..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-input text-sm"
                    />
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Submit Update'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUpdateForm(false)}>
                    Cancel
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* History */}
          <Card className={showUpdateForm ? '' : 'lg:col-span-2'}>
            <CardHeader>
              <CardTitle>Update History</CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-sm">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStageColor(update.stage)}>{update.stage}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      {update.notes && (
                        <p className="text-sm">{update.notes}</p>
                      )}
                      {update.userName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {update.userName}
                        </p>
                      )}
                    </div>
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