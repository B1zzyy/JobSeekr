'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Download, Loader2, Sparkles } from 'lucide-react'
import UserProfile from '@/components/UserProfile'
import JobDescriptionInput from '@/components/JobDescriptionInput'
import StatusMessage from '@/components/StatusMessage'
import ThemeToggle from '@/components/ThemeToggle'
import CVRecommendations from '@/components/CVRecommendations'
import OnboardingWalkthrough from '@/components/OnboardingWalkthrough'

interface Recommendation {
  section: string
  location: string
  currentText: string
  suggestedText: string
  keywords: string[]
  reason: string
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState('')
  const [hasCV, setHasCV] = useState(false)
  const [isCheckingCV, setIsCheckingCV] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [coverLetter, setCoverLetter] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const recommendationsRef = useRef<HTMLDivElement>(null)
  const coverLetterRef = useRef<HTMLDivElement>(null)

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const data = await response.json()
          setShowOnboarding(!data.hasCompletedOnboarding)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setIsCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  // Check if user has CV stored
  useEffect(() => {
    const checkCVStatus = async () => {
      try {
        const response = await fetch('/api/user/cv/get')
        if (response.ok) {
          const data = await response.json()
          setHasCV(!!data.cvFile)
        }
      } catch (error) {
        console.error('Error checking CV status:', error)
      } finally {
        setIsCheckingCV(false)
      }
    }

    if (!showOnboarding) {
      checkCVStatus()
    }
  }, [showOnboarding])

  // Smooth scroll to recommendations when they're generated
  useEffect(() => {
    if (recommendations && recommendations.length > 0 && recommendationsRef.current) {
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100) // Small delay to ensure DOM has updated
    }
  }, [recommendations])

  // Smooth scroll to cover letter when it's generated
  useEffect(() => {
    if (coverLetter && coverLetterRef.current) {
      setTimeout(() => {
        coverLetterRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100) // Small delay to ensure DOM has updated
    }
  }, [coverLetter])

  const handleOptimizeCV = async () => {
    if (!hasCV || !jobDescription.trim()) {
      setStatus({ type: 'error', message: 'Please ensure you have a CV uploaded and enter a job description' })
      return
    }

    setIsOptimizing(true)
    setStatus(null)

    try {
      const formData = new FormData()
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
        setStatus(null)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to optimize CV. Please try again.' })
      console.error('Error optimizing CV:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!hasCV || !jobDescription.trim()) {
      setStatus({ type: 'error', message: 'Please ensure you have a CV uploaded and enter a job description' })
      return
    }

    setIsGeneratingCoverLetter(true)
    setStatus(null)

    try {
      const formData = new FormData()
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
      setStatus(null)
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to generate cover letter. Please try again.' })
      console.error('Error generating cover letter:', error)
    } finally {
      setIsGeneratingCoverLetter(false)
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

  // Don't render content while checking onboarding status
  if (isCheckingOnboarding) {
    return null
  }

  // Show onboarding walkthrough
  if (showOnboarding) {
    return (
      <OnboardingWalkthrough
        onComplete={() => setShowOnboarding(false)}
        onCVUpload={async () => {
          // CV upload is handled in onboarding
          const response = await fetch('/api/user/cv/get')
          if (response.ok) {
            const data = await response.json()
            setHasCV(!!data.cvFile)
          }
        }}
        cvFile={null}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* User Profile - Top Right */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
        <UserProfile />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-4xl">
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

        {/* Main Content - Job Description */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
              Job Description
            </h2>
          </div>
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            hasCV={hasCV}
          />
        </div>

        {/* Action Buttons */}
        {!recommendations && !coverLetter && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end mb-6">
            <button
              onClick={handleOptimizeCV}
              disabled={!hasCV || !jobDescription.trim() || isOptimizing || isGeneratingCoverLetter}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold text-sm md:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Optimize CV
                </>
              )}
            </button>
            <button
              onClick={handleGenerateCoverLetter}
              disabled={!hasCV || !jobDescription.trim() || isOptimizing || isGeneratingCoverLetter}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity font-semibold text-sm md:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingCoverLetter ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="mb-6">
            <StatusMessage status={status} />
          </div>
        )}

        {/* CV Recommendations */}
        {recommendations && (
          <div ref={recommendationsRef} className="mb-8">
            <CVRecommendations recommendations={recommendations} />
            {!coverLetter && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={!hasCV || !jobDescription.trim() || isOptimizing || isGeneratingCoverLetter}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity font-semibold text-sm md:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingCoverLetter ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cover Letter */}
        {coverLetter && (
          <div ref={coverLetterRef} className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
                  Cover Letter
                </h2>
              </div>
              <button
                onClick={() => handleDownload(coverLetter, 'cover-letter.pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden">
              <iframe
                src={coverLetter}
                className="w-full h-full"
                title="Cover Letter Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
