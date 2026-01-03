'use client'

import { useState } from 'react'
import { Upload, FileText, Download, Loader2, Sparkles } from 'lucide-react'
import CVUpload from '@/components/CVUpload'
import JobDescriptionInput from '@/components/JobDescriptionInput'
import ActionButtons from '@/components/ActionButtons'
import StatusMessage from '@/components/StatusMessage'
import ThemeToggle from '@/components/ThemeToggle'
import CVRecommendations from '@/components/CVRecommendations'

interface Recommendation {
  section: string
  location: string
  currentText: string
  suggestedText: string
  keywords: string[]
  reason: string
}

export default function Home() {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [coverLetter, setCoverLetter] = useState<string | null>(null)

  const handleCVUpload = (file: File) => {
    setCvFile(file)
  }

  const handleCVRemove = () => {
    setCvFile(null)
    setRecommendations(null)
    setCoverLetter(null)
    setStatus(null)
  }

  const handleOptimizeCV = async () => {
    if (!cvFile || !jobDescription.trim()) {
      setStatus({ type: 'error', message: 'Please upload a CV and enter a job description' })
      return
    }

    setIsProcessing(true)
    setStatus({ type: 'info', message: 'Optimizing your CV with AI...' })

    try {
      const formData = new FormData()
      formData.append('cv', cvFile)
      formData.append('jobDescription', jobDescription)

      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to optimize CV' }))
        throw new Error(errorData.error || 'Failed to optimize CV')
      }

      const data = await response.json()
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations)
        setStatus({ type: 'success', message: `Found ${data.recommendations.length} optimization recommendations!` })
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to optimize CV. Please try again.' })
      console.error('Error optimizing CV:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!cvFile || !jobDescription.trim()) {
      setStatus({ type: 'error', message: 'Please upload a CV and enter a job description' })
      return
    }

    setIsProcessing(true)
    setStatus({ type: 'info', message: 'Generating cover letter with AI...' })

    try {
      const formData = new FormData()
      formData.append('cv', cvFile)
      formData.append('jobDescription', jobDescription)

      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate cover letter' }))
        throw new Error(errorData.error || 'Failed to generate cover letter')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setCoverLetter(url)
      setStatus({ type: 'success', message: 'Cover letter generated successfully! You can download it now.' })
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to generate cover letter. Please try again.' })
      console.error('Error generating cover letter:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              JobSeekr
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Optimize your CV with AI and generate personalized cover letters in seconds
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* CV Upload Section */}
          <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
                Upload Your CV
              </h2>
            </div>
            <CVUpload onFileUpload={handleCVUpload} file={cvFile} onFileRemove={handleCVRemove} />
          </div>

          {/* Job Description Section */}
          <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
                Job Description
              </h2>
            </div>
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
              hasCV={!!cvFile}
            />
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className="mb-6">
            <StatusMessage status={status} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8">
          <ActionButtons
            onOptimizeCV={handleOptimizeCV}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            isProcessing={isProcessing}
            disabled={!cvFile || !jobDescription.trim()}
          />
        </div>

        {/* CV Recommendations */}
        {recommendations && (
          <div className="mb-8">
            <CVRecommendations recommendations={recommendations} />
          </div>
        )}

        {/* Download Section */}
        {coverLetter && (
          <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <h2 className="text-xl md:text-2xl font-semibold text-card-foreground mb-4">
              Download Cover Letter
            </h2>
            <button
              onClick={() => handleDownload(coverLetter, 'cover-letter.pdf')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
            >
              <Download className="w-5 h-5" />
              Download Cover Letter
            </button>
          </div>
        )}
      </div>
      <ThemeToggle />
    </div>
  )
}

