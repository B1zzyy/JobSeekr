'use client'

import { Clipboard } from 'lucide-react'

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
  hasCV?: boolean
}

export default function JobDescriptionInput({ value, onChange, hasCV }: JobDescriptionInputProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      // Append to existing content, or replace if empty
      if (value.trim()) {
        onChange(value + '\n' + text)
      } else {
        onChange(text)
      }
    } catch (error) {
      console.error('Failed to paste:', error)
      // Show a user-friendly message if clipboard API is not available
      alert('Unable to paste. Please use Ctrl+V (or Cmd+V on Mac) to paste.')
    }
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full p-4 pr-20 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm md:text-base scrollbar-minimal h-[350px] md:h-[600px]"
        style={{ minHeight: '350px' }}
      />
      <button
        onClick={handlePaste}
        className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Paste from clipboard"
        title="Paste"
      >
        <Clipboard className="w-4 h-4" />
        <span>Paste</span>
      </button>
    </div>
  )
}
