'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Zap,
  Briefcase, 
  Settings, 
  Menu, 
  User as UserIcon,
  LogOut,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { signOut as signOutAction } from '@/app/auth/actions'

interface UserInfo {
  username: string | null
  email: string
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showText, setShowText] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUserInfo()
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

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
  }

  const handleSignOut = async () => {
    await signOutAction()
  }

  const handleToggleCollapse = () => {
    if (isCollapsed) {
      // Expanding - show text after delay
      setIsCollapsed(false)
      setTimeout(() => {
        setShowText(true)
      }, 200) // Delay to match sidebar expansion animation
    } else {
      // Collapsing - hide text immediately
      setShowText(false)
      setIsCollapsed(true)
    }
  }

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/studio', icon: Zap, label: 'Studio' },
    { href: '/applications', icon: Briefcase, label: 'Applications' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  const displayName = userInfo?.username || userInfo?.email?.split('@')[0] || 'User'

  return (
    <>
      {/* Mobile hamburger button - Bottom Left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg md:hidden transition-opacity ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={(e) => {
            // Close if clicking on the overlay, but not on the sidebar itself
            if (e.target === e.currentTarget) {
              setIsOpen(false)
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-40
          flex flex-col
          transform transition-all duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20 md:w-20' : 'w-64 md:w-64'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border h-[120px] flex items-center">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex flex-col items-center justify-center gap-3 text-foreground hover:opacity-80 w-full"
          >
            <div style={{ width: '64px', height: '64px', flexShrink: 0 }}>
              <Image 
                src="/logo.png" 
                alt="JobSeekr Logo" 
                width={64} 
                height={64} 
                className="object-contain"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <span className={`text-xl font-bold transition-opacity duration-200 ${showText && !isCollapsed ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden absolute pointer-events-none'}`}>JobSeekr</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
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
                  flex items-center rounded-lg transition-colors h-12
                  ${
                    isCollapsed
                      ? 'justify-center px-4'
                      : 'gap-3 px-4'
                  }
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium transition-opacity duration-200 ${showText && !isCollapsed ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden absolute'}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Collapse/Expand Button - Desktop Only - Positioned at middle height */}
        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0">
          <button
            onClick={handleToggleCollapse}
            className="p-2 rounded-l-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-card border border-r-0 border-border"
            style={{ boxShadow: '-6px 0 12px 0 rgba(0, 0, 0, 0.2)' }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-border p-4">
          {loading ? (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4 py-3'}`}>
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              {!isCollapsed && <div className="flex-1 h-4 bg-muted rounded animate-pulse" />}
            </div>
          ) : userInfo ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`w-full flex items-center rounded-lg hover:bg-muted transition-colors h-12 px-4 ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                }`}
                title={isCollapsed ? displayName : undefined}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                <div className={`flex-1 text-left min-w-0 transition-opacity duration-200 ${showText && !isCollapsed ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden absolute'}`}>
                  <div className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userInfo.email}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-all flex-shrink-0 duration-200 ${
                    showText && !isCollapsed ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden absolute'
                  } ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className={`absolute bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden ${
                  isCollapsed ? 'left-full ml-2 w-64' : 'left-0 right-0'
                }`}>
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
      <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  )
}

