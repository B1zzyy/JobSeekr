'use client'

import { useState } from 'react'
import { signIn, signUp } from './actions'
import { Loader2, Mail, Lock, Sparkles, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

// Function to get email provider URL
function getEmailProviderUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  
  const providerMap: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'yahoo.com': 'https://mail.yahoo.com',
    'yahoo.co.uk': 'https://mail.yahoo.com',
    'outlook.com': 'https://outlook.live.com',
    'hotmail.com': 'https://outlook.live.com',
    'icloud.com': 'https://www.icloud.com/mail',
    'aol.com': 'https://mail.aol.com',
    'protonmail.com': 'https://mail.proton.me',
    'zoho.com': 'https://mail.zoho.com',
  }
  
  return providerMap[domain] || `https://www.google.com/search?q=${encodeURIComponent(domain + ' email login')}`
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match for sign up
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const formData = new FormData()
    if (isSignUp) {
      formData.append('username', username)
    }
    formData.append('email', email)
    formData.append('password', password)

    try {
      if (isSignUp) {
        const result = await signUp(formData)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSignupSuccess(true)
          setSignupEmail(email)
        }
      } else {
        const result = await signIn(formData)
        if (result?.error) {
          setError(result.error)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenMail = () => {
    const mailUrl = getEmailProviderUrl(signupEmail)
    window.open(mailUrl, '_blank')
  }

  const handleGoToLogin = () => {
    setSignupSuccess(false)
    setIsSignUp(false)
    setEmail(signupEmail)
    setPassword('')
    setConfirmPassword('')
    setUsername('')
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile: Full width form, Desktop: Left side form (1/4) */}
      <div className="w-full md:w-1/4 bg-card md:border-r border-b md:border-b-0 border-border flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-[100vh] md:min-h-screen">
        <div className="w-full max-w-md">
          {signupSuccess ? (
            /* Success View */
            <div className="space-y-6 text-center animate-fade-in-slide-down py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Account Created Successfully!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed px-2">
                  We've sent a confirmation email to <span className="font-semibold text-foreground break-all">{signupEmail}</span>. 
                  Please check your inbox and click the confirmation link to verify your email address.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleOpenMail}
                  className="w-full py-3 sm:py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all flex items-center justify-center gap-2 text-base sm:text-sm"
                >
                  <Mail className="w-5 h-5" />
                  Open Mail
                </button>
                
                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3 sm:py-2.5 bg-background border border-input text-foreground rounded-lg font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all text-base sm:text-sm"
                >
                  Login
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <>
              {/* Logo/Title */}
              <div className="mb-6 sm:mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">JobSeekr</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Username Input - Only for Sign Up */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-foreground">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required={isSignUp}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                        className="w-full pl-10 pr-16 py-3 sm:py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base sm:text-sm"
                        placeholder="Username"
                        maxLength={15}
                      />
                      {username.length >= 13 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          {username.length}/15
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base sm:text-sm"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 sm:py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base sm:text-sm"
                      placeholder="••••••••"
                      minLength={6}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 touch-manipulation"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input - Only for Sign Up and only visible when password is being entered */}
                {isSignUp && password.length > 0 && (
                  <div className="space-y-2 animate-fade-in-slide-down">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={isSignUp}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 sm:py-2.5 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base sm:text-sm ${
                          confirmPassword.length > 0 && password !== confirmPassword
                            ? 'border-destructive'
                            : 'border-input'
                        }`}
                        placeholder="••••••••"
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 touch-manipulation"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base sm:text-sm touch-manipulation"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Sign Up' : 'Sign In'
                  )}
                </button>

                {/* Toggle between Sign In and Sign Up */}
                <div className="text-center text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError(null)
                      setConfirmPassword('')
                      if (!isSignUp) {
                        setUsername('')
                      }
                    }}
                    className="text-primary hover:underline touch-manipulation py-2"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right side - Image/Video (3/4) - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/20 via-accent/10 to-background relative overflow-hidden">
        {/* Placeholder for image/video - you can replace this with an actual image or video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <Sparkles className="w-24 h-24 text-primary/30 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-foreground/80 mb-2">
              Your Career Journey Starts Here
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Optimize your CV and generate personalized cover letters with AI-powered tools
            </p>
          </div>
        </div>

        {/* Optional: Add a decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>
      </div>
    </div>
  )
}
