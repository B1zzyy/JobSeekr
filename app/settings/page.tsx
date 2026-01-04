'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Loader2, Settings, ArrowLeft } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

interface CVFile {
  fileName: string
  url: string
}

export default function SettingsPage() {
  const [cvFile, setCvFile] = useState<CVFile | null>(null)
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
        if (data.cvFile) {
          setCvFile(data.cvFile)
        }
      }
    } catch (error) {
      console.error('Error fetching CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
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
        await fetchCV()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading CV:', error)
      alert('Failed to upload CV. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.type === 'application/pdf') {
        handleUpload(file)
      } else {
        alert('Please upload a PDF file')
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  // Extract original filename by removing path and timestamp prefix
  const getOriginalFileName = (fileName: string): string => {
    // Format: {userId}/{timestamp}_{originalFileName}
    // First, get just the filename part (after the last /)
    const filename = fileName.split('/').pop() || fileName
    // Then, remove the timestamp prefix (numbers before underscore)
    const match = filename.match(/^\d+_(.+)$/)
    return match ? match[1] : filename
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const displayFileName = cvFile ? getOriginalFileName(cvFile.fileName) : null

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

        {/* Your CV Section */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
              Your CV
            </h2>
          </div>

          {cvFile ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current CV:</p>
                <p className="text-sm text-foreground">{displayFileName}</p>
              </div>

              {/* CV Preview */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="w-full h-[600px]">
                  <iframe
                    src={cvFile.url}
                    className="w-full h-full"
                    title="CV Preview"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Upload a new CV to replace your current one. This CV will be used for all job applications.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              You haven't uploaded a CV yet. Upload your CV to get started with optimizations and cover letters.
            </p>
          )}

          {/* Upload Section */}
          <div className="mt-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50 bg-muted/30'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={uploading} />
              <div className="flex flex-col items-center gap-4">
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-primary font-medium">Uploading...</p>
                  </>
                ) : isDragActive ? (
                  <>
                    <Upload className="w-12 h-12 text-primary" />
                    <p className="text-primary font-medium">Drop your CV here</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">
                        Drag & drop your CV here, or click to select
                      </p>
                      <p className="text-sm text-muted-foreground">PDF files only</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {success && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">CV uploaded successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
