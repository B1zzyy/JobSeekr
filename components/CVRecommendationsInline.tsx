'use client'

import { useState } from 'react'
import { ArrowDown, Tag, ChevronLeft, ChevronRight, Copy, Check, Sparkles } from 'lucide-react'

interface Recommendation {
  section: string
  location: string
  currentText: string
  suggestedText: string
  keywords: string[]
  reason: string
}

interface CVRecommendationsInlineProps {
  recommendations: Recommendation[]
}

export default function CVRecommendationsInline({ recommendations }: CVRecommendationsInlineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  const currentRec = recommendations[currentIndex]
  const total = recommendations.length

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(index)
  }

  const copyToClipboard = async (text: string, fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">
          CV Suggestions
        </h2>
      </div>

      {/* Scrollable Content - Fixed Height Container */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Current Recommendation Card - Scrollable - FIXED HEIGHT */}
        <div className="border border-border rounded-lg p-5 bg-muted/30 flex-1 min-h-0 overflow-y-auto scrollbar-minimal">
          {/* Section Header */}
          <div className="flex items-start justify-between mb-4 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground text-base mb-1 truncate">
                {currentRec.section}
              </h3>
              {currentRec.location && (
                <p className="text-xs text-muted-foreground truncate">{currentRec.location}</p>
              )}
            </div>
          </div>

          {/* Keywords */}
          {currentRec.keywords && currentRec.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 flex-shrink-0">
              {currentRec.keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 text-xs rounded-md font-medium"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {keyword}
                </span>
              ))}
              {currentRec.keywords.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{currentRec.keywords.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Current Text */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Current
            </p>
            <div className="relative bg-background border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap pr-8">
                {currentRec.currentText}
              </p>
              <button
                onClick={(e) => copyToClipboard(currentRec.currentText, 'current', e)}
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
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Suggested
            </p>
            <div className="relative bg-background border border-primary/30 rounded-md p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap pr-8">
                {currentRec.suggestedText}
              </p>
              <button
                onClick={(e) => copyToClipboard(currentRec.suggestedText, 'suggested', e)}
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
            <div className="mt-4 pt-4 border-t border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground">{currentRec.reason}</p>
            </div>
          )}
        </div>
        
        {/* Navigation - Fixed at bottom */}
        <div className="flex justify-center items-center gap-3 pt-4 flex-shrink-0">
          <button
            onClick={goToPrevious}
            className="p-1.5 rounded-full bg-card/90 hover:bg-card border border-border text-foreground transition-colors shadow-md"
            aria-label="Previous recommendation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {recommendations.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToIndex(index, e)}
                className={`transition-all duration-200 rounded-full ${
                  index === currentIndex
                    ? 'w-2.5 h-2.5 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/60 hover:bg-muted-foreground/80 border border-border'
                }`}
                aria-label={`Go to recommendation ${index + 1}`}
              />
            ))}
            {recommendations.length > 10 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{recommendations.length - 10}
              </span>
            )}
          </div>

          <button
            onClick={goToNext}
            className="p-1.5 rounded-full bg-card/90 hover:bg-card border border-border text-foreground transition-colors shadow-md"
            aria-label="Next recommendation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

