'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings, LogOut, ChevronDown, User as UserIcon, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { signOut as signOutAction } from '@/app/auth/actions'

interface UserInfo {
  username: string | null
  email: string
}

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    fetchUserInfo()
    setMounted(true)
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info')
      if (response.ok) {
        const data = await response.json()
        setUserInfo({
          username: data.user.username,
          email: data.user.email,
        })
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOutAction()
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-muted animate-pulse" />
        <div className="hidden md:block w-24 h-4 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  const displayName = userInfo.username || userInfo.email?.split('@')[0] || 'User'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-muted transition-colors touch-manipulation"
        aria-label="User menu"
      >
        {/* Desktop: Show text, Mobile: Hide text */}
        <span className="hidden md:inline text-sm font-medium text-foreground">{displayName}</span>
        {/* Avatar - smaller on mobile */}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        {/* Chevron - smaller on mobile, hidden on mobile when open */}
        <ChevronDown className={`hidden md:block w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 md:w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 md:py-2.5 text-sm text-foreground hover:bg-muted transition-colors touch-manipulation"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Settings
            </Link>
            {mounted && (
              <div className="w-full flex items-center justify-between px-4 py-3 md:py-2.5 text-sm text-foreground">
                <span className="flex items-center gap-3">
                  <Moon className="w-4 h-4 flex-shrink-0" />
                  Dark Mode
                </span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label="Toggle theme"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 md:py-2.5 text-sm text-foreground hover:bg-muted transition-colors touch-manipulation"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

