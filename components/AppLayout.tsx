'use client'

import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-0">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}

