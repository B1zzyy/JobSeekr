'use client'

import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/components/AppLayout'
import { FileText, Calendar, Building2, Briefcase, ChevronDown } from 'lucide-react'

interface Application {
  id: string
  job_title: string | null
  company_name: string | null
  applied_at: string
  status: string
}

const STATUS_OPTIONS = [
  'Applied',
  'Viewed',
  '1st Round Interviews',
  '2nd Round Interviews',
  'Final Round Interviews',
  'Rejected',
  'Accepted',
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<{ id: string; field: 'company' | 'title' } | null>(null)
  const [editValue, setEditValue] = useState('')
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdown = dropdownRefs.current[openDropdownId]
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdownId(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications/list')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setOpenDropdownId(null)

    // Store the previous status in case we need to revert
    const previousApplications = applications
    const previousStatus = applications.find(app => app.id === applicationId)?.status || 'Applied'

    // Optimistic update - update UI immediately
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    )

    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        // Revert to previous state on error
        setApplications(previousApplications)
        console.error('Failed to update status')
        // You could add a toast notification here if desired
      }
    } catch (error) {
      // Revert to previous state on error
      setApplications(previousApplications)
      console.error('Error updating status:', error)
      // You could add a toast notification here if desired
    }
  }

  const startEditing = (applicationId: string, field: 'company' | 'title', currentValue: string | null) => {
    setEditingField({ id: applicationId, field })
    setEditValue(currentValue || '')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue('')
  }

  const saveEditing = async () => {
    if (!editingField) return

    const applicationId = editingField.id
    const field = editingField.field
    const newValue = editValue.trim()
    
    // Get current application
    const currentApp = applications.find(app => app.id === applicationId)
    if (!currentApp) return

    // Store previous state for revert
    const previousApplications = applications

    // Optimistic update
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? {
              ...app,
              company_name: field === 'company' ? (newValue || null) : app.company_name,
              job_title: field === 'title' ? (newValue || null) : app.job_title,
            }
          : app
      )
    )

    setEditingField(null)
    setEditValue('')

    try {
      const response = await fetch('/api/applications/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          companyName: field === 'company' ? newValue : undefined,
          jobTitle: field === 'title' ? newValue : undefined,
        }),
      })

      if (!response.ok) {
        // Revert on error
        setApplications(previousApplications)
        console.error('Failed to update application')
      }
    } catch (error) {
      // Revert on error
      setApplications(previousApplications)
      console.error('Error updating application:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEditing()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
      case 'Rejected':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
      case 'Final Round Interviews':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
      case '2nd Round Interviews':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case '1st Round Interviews':
        return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      case 'Applied':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'Viewed':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      {loading ? (
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No applications yet</h2>
          <p className="text-muted-foreground">Applications you save will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6">
                {/* Company Name - Fixed width, editable */}
                <div className="flex items-center gap-2 min-w-[180px] max-w-[180px]">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {editingField?.id === application.id && editingField?.field === 'company' ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={handleKeyDown}
                      className="text-sm font-medium bg-background border border-border rounded px-2 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Company name"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(application.id, 'company', application.company_name)}
                      className={`text-sm font-medium truncate text-left flex-1 min-w-0 cursor-text overflow-hidden ${
                        !application.company_name || application.company_name === 'Unknown Company'
                          ? 'text-muted-foreground italic'
                          : 'text-foreground'
                      }`}
                    >
                      {application.company_name && application.company_name !== 'Unknown Company'
                        ? application.company_name
                        : 'Click to add company'}
                    </button>
                  )}
                </div>
                
                {/* Job Title - Fixed width, editable */}
                <div className="flex items-center gap-2 min-w-[200px] flex-1 max-w-[300px]">
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {editingField?.id === application.id && editingField?.field === 'title' ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={handleKeyDown}
                      className="text-sm bg-background border border-border rounded px-2 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Job title"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(application.id, 'title', application.job_title)}
                      className={`text-sm truncate text-left flex-1 min-w-0 cursor-text overflow-hidden ${
                        !application.job_title || application.job_title === 'Unknown Position'
                          ? 'text-muted-foreground italic'
                          : 'text-foreground'
                      }`}
                    >
                      {application.job_title && application.job_title !== 'Unknown Position'
                        ? application.job_title
                        : 'Click to add job title'}
                    </button>
                  )}
                </div>
                
                {/* Date - Fixed width */}
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(application.applied_at)}
                  </span>
                </div>

                {/* Status dropdown - Fixed width, aligned right */}
                <div className="relative ml-auto" ref={el => (dropdownRefs.current[application.id] = el)}>
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === application.id ? null : application.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${getStatusColor(application.status)}`}
                  >
                    <span>{application.status}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdownId === application.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdownId === application.id && (
                    <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(application.id, status)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            application.status === status ? 'bg-muted font-medium' : ''
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
