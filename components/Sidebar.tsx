'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sparkles, 
  Home,
  Briefcase, 
  Settings, 
  Menu, 
  X, 
  User as UserIcon,
  LogOut,
  Moon,
  ChevronDown
} from 'lucide-react'
import { signOut as signOutAction } from '@/app/auth/actions'

interface UserInfo {
  username: string | null
  email: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchUserInfo()
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
  }, [])

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

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
    setUserMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOutAction()
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/applications', icon: Briefcase, label: 'Applications' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  const displayName = userInfo?.username || userInfo?.email?.split('@')[0] || 'User'

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">JobSeekr</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  setIsOpen(false)
                  // Prevent navigation if already on this page
                  if (isActive) {
                    e.preventDefault()
                  }
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
            </div>
          ) : userInfo ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userInfo.email}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {mounted && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="flex items-center gap-3 text-sm text-foreground">
                        <Moon className="w-4 h-4" />
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}

