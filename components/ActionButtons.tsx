'use client'

import { Sparkles, FileText, Loader2 } from 'lucide-react'

interface ActionButtonsProps {
  onOptimizeCV: () => void
  onGenerateCoverLetter: () => void
  isOptimizing: boolean
  isGeneratingCoverLetter: boolean
  disabled: boolean
  hasOptimized: boolean
  hasGeneratedCoverLetter: boolean
}

export default function ActionButtons({
  onOptimizeCV,
  onGenerateCoverLetter,
  isOptimizing,
  isGeneratingCoverLetter,
  disabled,
  hasOptimized,
  hasGeneratedCoverLetter,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {!hasOptimized && (
        <button
          onClick={onOptimizeCV}
          disabled={disabled || isOptimizing || isGeneratingCoverLetter}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold text-base md:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Optimize CV
            </>
          )}
        </button>
      )}
      {!hasGeneratedCoverLetter && (
        <button
          onClick={onGenerateCoverLetter}
          disabled={disabled || isOptimizing || isGeneratingCoverLetter}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold text-base md:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingCoverLetter ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Cover Letter
            </>
          )}
        </button>
      )}
    </div>
  )
}

