'use client'

import { FileCheck, FileX, Settings } from 'lucide-react'
import Link from 'next/link'

interface CVStatusProps {
  hasCV: boolean
}

export default function CVStatus({ hasCV }: CVStatusProps) {
  if (!hasCV) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
        <FileX className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium mb-1">No CV uploaded</p>
          <p className="text-xs text-muted-foreground mb-3">
            Upload your CV in settings to get started with optimizations and cover letters.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
          >
            <Settings className="w-3 h-3" />
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
      <FileCheck className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-foreground font-medium">CV ready</p>
        <p className="text-xs text-muted-foreground">
          Using your saved CV. You can update it in{' '}
          <Link href="/settings" className="text-primary hover:underline font-medium">
            settings
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

