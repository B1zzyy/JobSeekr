'use client'

import { useState, useEffect } from 'react'
import { FileText, ArrowRight, CheckCircle2, Sparkles, Upload, Clipboard, Zap, Mail } from 'lucide-react'
import CVUpload from '@/components/CVUpload'
import Image from 'next/image'

interface OnboardingWalkthroughProps {
  onComplete: () => void
  onCVUpload: (file: File) => void
  cvFile: File | null
}

export default function OnboardingWalkthrough({ onComplete, onCVUpload, cvFile }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(1)

  // Auto-advance to step 3 when CV is uploaded
  useEffect(() => {
    const uploadCV = async () => {
      if (cvFile && currentStep === 2) {
        try {
          // Upload CV to user profile
          const formData = new FormData()
          formData.append('cv', cvFile)

          const response = await fetch('/api/user/cv/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            // Small delay for better UX
            setTimeout(() => {
              setCurrentStep(3)
            }, 500)
          }
        } catch (error) {
          console.error('Error uploading CV:', error)
        }
      }
    }

    uploadCV()
  }, [cvFile, currentStep])

  const handleNext = async () => {
    if (currentStep === 1) {
      // Move to CV upload step
      setCurrentStep(2)
    } else if (currentStep === 3) {
      // Complete onboarding
      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
        })
        
        if (response.ok) {
          onComplete()
        }
      } catch (error) {
        console.error('Error completing onboarding:', error)
        // Still complete the walkthrough even if API call fails
        onComplete()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Step 1: Welcome/Introduction */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in-slide-down">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                  <Image 
                    src="/logo.png" 
                    alt="JobSeekr Logo" 
                    width={80} 
                    height={80} 
                    className="object-contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome to JobSeekr
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Your AI-powered assistant for crafting the perfect job application
              </p>
            </div>

            {/* How it Works */}
            <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                How It Works
              </h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clipboard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">1. Paste Job Description</h3>
                    <p className="text-sm text-muted-foreground">
                      Simply paste the job description you're applying for
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">2. Get CV Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes the job requirements and suggests CV improvements tailored to the role
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">3. Generate Cover Letter</h3>
                    <p className="text-sm text-muted-foreground">
                      Instantly create a personalized, professional cover letter that matches your style
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-8 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
            </div>
          </div>
        )}

        {/* Step 2: Add CV */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in-slide-down">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Add Your CV to Your Profile
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Your CV will be automatically used for all job applications. Don't worry, you can always change it later from your settings.
              </p>
            </div>

            {/* CV Upload */}
            <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
              <CVUpload onFileUpload={onCVUpload} file={cvFile} />
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
              <div className="h-2 w-8 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
            </div>
          </div>
        )}

        {/* Step 3: Completion */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-in-slide-down">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Yep, That's It!
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                I know, right? You're all set! Enjoy the perks of having your CV ready for every job application. 
                Just paste a job description, get AI-powered suggestions, and generate personalized cover letters in seconds.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-base font-medium text-primary">Happy job hunting!</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60 border border-border" />
              <div className="h-2 w-8 rounded-full bg-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
