'use client'

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
  hasCV?: boolean
}

export default function JobDescriptionInput({ value, onChange, hasCV }: JobDescriptionInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste the job description here... Include key requirements, responsibilities, and qualifications."
      className={`w-full p-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm md:text-base scrollbar-minimal ${
        hasCV ? 'h-[600px]' : 'h-64 md:h-80'
      }`}
    />
  )
}

