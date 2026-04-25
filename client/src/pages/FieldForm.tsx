/**
 * SmartSeason Field Registration & Editing Form
 * 
 * This component handles both the creation of new fields and the updating 
 * of existing ones. It is strictly reserved for Administrator use.
 * 
 * Logic Flow:
 * 1. Mode Detection: Checks if an 'id' exists in the URL to decide between POST (new) or PUT (edit).
 * 2. Agent Loading: Fetches a list of all 'Agent' role users to populate the assignment dropdown.
 * 3. Data Fetching (Edit Mode): Pre-fills the form with existing field data.
 * 4. Submission: Validates and sends data to the Node.js backend.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/App'
import { ArrowLeft } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
}

export default function FieldForm() {
  const { id } = useParams<{ id: string }>()
  useAuth() // Middleware-like check to ensure auth context is ready
  const navigate = useNavigate()
  
  // Deterministic state based on URL parameters
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    cropType: '',
    plantingDate: '',
    stage: 'Planted',
    agentId: ''
  })
  
  const [agents, setAgents] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  /**
   * Initial Setup
   * We need the list of agents regardless of whether we are creating or editing.
   */
  useEffect(() => {
    loadAgents()
    if (id) {
      loadField(parseInt(id))
    }
  }, [id])

  /**
   * loadAgents
   * Populates the "Assign Agent" dropdown with active team members.
   */
  const loadAgents = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/users?role=agent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  /**
   * loadField
   * If in edit mode, we fetch the current details to populate the form fields.
   */
  const loadField = async (fieldId: number) => {
    setIsLoading(true)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const res = await fetch(`${apiBase}/api/fields/${fieldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name,
          cropType: data.cropType,
          // Extract only the YYYY-MM-DD part for the HTML date input
          plantingDate: data.plantingDate.split('T')[0],
          stage: data.stage,
          agentId: data.agentId?.toString() || ''
        })
      }
    } catch (error) {
      console.error('Failed to load field:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handleSubmit
   * Dispatches the data to the server. Uses PUT for updates and POST for creations.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const token = localStorage.getItem('smartseason_token')
      const url = id ? `${apiBase}/api/fields/${id}` : `${apiBase}/api/fields`
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Convert the agentId back to a number for the backend
          agentId: formData.agentId ? parseInt(formData.agentId) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Validation failed. Please check your inputs.')
      }

      // Success! Back to the list.
      navigate('/fields')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A server error occurred while saving.')
    } finally {
      setIsSubmitting(false)
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={isEditing ? `/fields/${id}` : '/fields'}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-secondary">
              {isEditing ? 'Modify Monitoring Asset' : 'Register New Field'}
            </h1>
            <p className="text-sm text-muted-foreground">Fill in the details to track crop progress.</p>
          </div>
        </div>

        <Card className="shadow-lg border-slate-200">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-8">
              {/* Error Banner */}
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in fade-in duration-300">
                  <p className="font-bold">Error saving data:</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Asset Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-input text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. North Valley Corn-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Crop Type</label>
                    <input
                      type="text"
                      value={formData.cropType}
                      onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                      required
                      className="w-full h-11 px-4 rounded-lg border border-input text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Wheat, Maize"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Planting Date</label>
                    <input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                      required
                      className="w-full h-11 px-4 rounded-lg border border-input text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Phase</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-input text-sm font-semibold bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="Planted">Planted</option>
                    <option value="Growing">Growing</option>
                    <option value="Ready">Ready</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Assign Field Agent</label>
                  <select
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-input text-sm font-semibold bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Choose a professional...</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} — {agent.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium italic">Agents are responsible for bi-weekly monitoring reports.</p>
                </div>
              </div>
            </CardContent>

            {/* Form Footer */}
            <CardFooter className="justify-end gap-3 bg-slate-50/50 p-6 border-t">
              <Link to="/fields">
                <Button type="button" variant="ghost" className="font-semibold">Cancel</Button>
              </Link>
              <Button type="submit" className="px-8 font-bold shadow-md transition-all hover:scale-[1.02]" disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting Data...' : isEditing ? 'Update Records' : 'Register Field'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}