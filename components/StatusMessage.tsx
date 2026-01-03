'use client'

import { CheckCircle2, XCircle, Info } from 'lucide-react'

interface StatusMessageProps {
  status: {
    type: 'success' | 'error' | 'info'
    message: string
  }
}

export default function StatusMessage({ status }: StatusMessageProps) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }

  const styles = {
    success: 'bg-primary/10 text-primary border-primary/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-accent/10 text-accent border-accent/20',
  }

  const Icon = icons[status.type]

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${styles[status.type]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm md:text-base">{status.message}</p>
    </div>
  )
}

