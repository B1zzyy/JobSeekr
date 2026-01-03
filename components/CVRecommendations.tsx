'use client'

import { useState } from 'react'
import { FileText, CheckCircle2, ArrowDown, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'

interface Recommendation {
  section: string
  location: string
  currentText: string
  suggestedText: string
  keywords: string[]
  reason: string
}

interface CVRecommendationsProps {
  recommendations: Recommendation[]
}

export default function CVRecommendations({ recommendations }: CVRecommendationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
        <p className="text-muted-foreground text-center">No recommendations available.</p>
      </div>
    )
  }

  const currentRec = recommendations[currentIndex]
  const total = recommendations.length

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold text-card-foreground">
          CV Optimization Recommendations
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Current Recommendation Card */}
        <div className="border border-border rounded-lg p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
          {/* Section Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-1">
                {currentRec.section}
              </h3>
              {currentRec.location && (
                <p className="text-sm text-muted-foreground">{currentRec.location}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                #{currentIndex + 1}
              </span>
            </div>
          </div>

          {/* Keywords */}
          {currentRec.keywords && currentRec.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentRec.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 text-xs rounded-md font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Current Text */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Current Text
            </p>
            <div className="relative bg-background border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap pr-10">
                {currentRec.currentText}
              </p>
              <button
                onClick={() => copyToClipboard(currentRec.currentText, 'current')}
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm"
                aria-label="Copy current text"
              >
                {copiedField === 'current' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <ArrowDown className="w-5 h-5 text-primary" />
          </div>

          {/* Suggested Text */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Suggested Text
            </p>
            <div className="relative bg-background border border-primary/30 rounded-md p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap pr-10">
                {currentRec.suggestedText}
              </p>
              <button
                onClick={() => copyToClipboard(currentRec.suggestedText, 'suggested')}
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm"
                aria-label="Copy suggested text"
              >
                {copiedField === 'suggested' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Reason */}
          {currentRec.reason && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{currentRec.reason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation and Indicator Dots */}
        <div className="flex justify-center items-center gap-4 mt-6">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-card/90 hover:bg-card border border-border text-foreground transition-all shadow-lg hover:scale-110"
            aria-label="Previous recommendation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`transition-all duration-200 rounded-full ${
                  index === currentIndex
                    ? 'w-3 h-3 bg-primary'
                    : 'w-2.5 h-2.5 bg-muted-foreground/60 hover:bg-muted-foreground/80 border border-border'
                }`}
                aria-label={`Go to recommendation ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-card/90 hover:bg-card border border-border text-foreground transition-all shadow-lg hover:scale-110"
            aria-label="Next recommendation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-sm text-foreground">
          <strong>Next steps:</strong> Review each recommendation and manually update your CV with the suggested changes. 
          Download your original CV if needed, then apply these improvements to maintain your CV's original formatting.
        </p>
      </div>
    </div>
  )
}
