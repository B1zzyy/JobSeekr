'use client'

import { useState, useEffect } from 'react'
import { Settings, FileText, Upload, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import CVUpload from '@/components/CVUpload'
import Link from 'next/link'

interface CVFile {
  fileName: string
  url: string
}

export default function SettingsPage() {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [savedCV, setSavedCV] = useState<CVFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchCV()
  }, [])

  const fetchCV = async () => {
    try {
      const response = await fetch('/api/user/cv/get')
      if (response.ok) {
        const data = await response.json()
        setSavedCV(data.cvFile)
      }
    } catch (error) {
      console.error('Error fetching CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCVUpload = async (file: File) => {
    setCvFile(file)
    setUploading(true)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('cv', file)

      const response = await fetch('/api/user/cv/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSavedCV({
          fileName: data.fileName,
          url: data.url,
        })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const error = await response.json()
        console.error('Error uploading CV:', error)
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
          </div>
        </div>

        {/* CV Section */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
              Your CV
            </h2>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-primary text-sm">CV updated successfully!</p>
            </div>
          )}

          {savedCV && (
            <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Current CV:</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {savedCV.fileName.split('/').pop()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a new CV to replace your current one. This CV will be used for all job applications.
            </p>
            
            <CVUpload
              onFileUpload={handleCVUpload}
              file={cvFile}
              onFileRemove={() => setCvFile(null)}
            />

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Uploading CV...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

