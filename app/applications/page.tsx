'use client'

import AppLayout from '@/components/AppLayout'
import { FileText } from 'lucide-react'

export default function ApplicationsPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      <div className="bg-card rounded-lg p-8 border border-border text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No applications yet</h2>
        <p className="text-muted-foreground">
          Applications you save will appear here
        </p>
      </div>
    </AppLayout>
  )
}

