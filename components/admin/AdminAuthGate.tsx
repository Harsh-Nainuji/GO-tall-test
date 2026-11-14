'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, KeyRound, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react'

interface AdminAuthGateProps {
  children: React.ReactNode
}

const AUTH_STORAGE_KEY = 'gotall_admin_session_auth'
const FAILED_ATTEMPTS_KEY = 'gotall_admin_fail_attempts'
const LOCKOUT_TIMESTAMP_KEY = 'gotall_admin_lockout_until'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [passcode, setPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0)

  // Expected Admin Key from Environment or Default Secure Key
  const validKey = process.env.NEXT_PUBLIC_ADMIN_PIN || 'GoTall@Admin2026'

  useEffect(() => {
    // 1. Check lockout status
    const lockoutUntil = Number(localStorage.getItem(LOCKOUT_TIMESTAMP_KEY) || 0)
    const now = Date.now()
    if (lockoutUntil > now) {
      setIsLockedOut(true)
      setRemainingLockSeconds(Math.ceil((lockoutUntil - now) / 1000))
    }

    // 2. Check existing session
    const sessionToken = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (sessionToken === 'authenticated_admin_active') {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  // Lockout countdown timer
  useEffect(() => {
    if (!isLockedOut) return

    const interval = setInterval(() => {
      const lockoutUntil = Number(localStorage.getItem(LOCKOUT_TIMESTAMP_KEY) || 0)
      const now = Date.now()
      const diff = Math.ceil((lockoutUntil - now) / 1000)

      if (diff <= 0) {
        setIsLockedOut(false)
        localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY)
        localStorage.removeItem(FAILED_ATTEMPTS_KEY)
        setErrorMsg('')
        clearInterval(interval)
      } else {
        setRemainingLockSeconds(diff)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLockedOut])

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLockedOut) return

    const trimmed = passcode.trim()
    if (!trimmed) {
      setErrorMsg('Please enter the administrator passcode')
      return
    }

    if (trimmed === validKey) {
      // Success: clear fails, set session
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated_admin_active')
      localStorage.removeItem(FAILED_ATTEMPTS_KEY)
      localStorage.removeItem(LOCKOUT_TIMESTAMP_KEY)
      setIsAuthenticated(true)
      setErrorMsg('')
    } else {
      // Failure: increment failed count
      const currentFails = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY) || 0) + 1
      localStorage.setItem(FAILED_ATTEMPTS_KEY, String(currentFails))

      if (currentFails >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS
        localStorage.setItem(LOCKOUT_TIMESTAMP_KEY, String(lockoutTime))
        setIsLockedOut(true)
        setRemainingLockSeconds(LOCKOUT_DURATION_MS / 1000)
        setErrorMsg(`Too many incorrect attempts. Locked out for 10 minutes.`)
      } else {
        const attemptsLeft = MAX_ATTEMPTS - currentFails
        setErrorMsg(`Invalid passcode. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before lockout.`)
      }
      setPasscode('')
    }
  }

  // Prevent flash while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Render Admin Lockscreen
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Subtle Radial Glow Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl relative z-10 text-white"
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Restricted Admin Area
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">GoTall Studio Authentication</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Enter your authorized operator credentials to access the exercises, nutrition CMS, and member data.
          </p>
        </div>

        {/* Lockout Warning */}
        {isLockedOut ? (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-300">Security Lockout Active</p>
              <p className="text-xs mt-1">
                Access is temporarily disabled due to consecutive failed attempts. Retry in{' '}
                <span className="font-mono font-bold text-white">
                  {Math.floor(remainingLockSeconds / 60)}m {remainingLockSeconds % 60}s
                </span>
                .
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Administrator Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Enter access passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isLockedOut}
                  autoFocus
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLockedOut}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Unlock Studio Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Protected by Session Isolation & Rate-Limit Shield
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Helper to log out of the admin session
 */
export function logoutAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    window.location.reload()
  }
}

