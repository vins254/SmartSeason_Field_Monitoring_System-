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
  useAuth() // Called to ensure context exists, but user value not needed here
  const navigate = useNavigate()
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

  useEffect(() => {
    loadAgents()
    if (id) {
      loadField(parseInt(id))
    }
  }, [id])

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
          agentId: formData.agentId ? parseInt(formData.agentId) : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save field')
      }

      navigate('/fields')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save field')
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
        <div className="flex items-center gap-4 mb-6">
          <Link to={isEditing ? `/fields/${id}` : '/fields'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Field' : 'Create New Field'}
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Field Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-md border border-input text-sm"
                  placeholder="Enter field name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Type</label>
                <input
                  type="text"
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-md border border-input text-sm"
                  placeholder="e.g., Wheat, Corn, Rice"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Planting Date</label>
                <input
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-md border border-input text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input text-sm"
                >
                  <option value="Planted">Planted</option>
                  <option value="Growing">Growing</option>
                  <option value="Ready">Ready</option>
                  <option value="Harvested">Harvested</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Agent</label>
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-md border border-input text-sm"
                >
                  <option value="">Select an agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Link to="/fields">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Field' : 'Create Field'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}