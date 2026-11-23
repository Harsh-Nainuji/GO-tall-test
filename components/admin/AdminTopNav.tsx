'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, CheckCircle2, Sparkles, LogOut } from 'lucide-react'
import { logoutAdminSession } from './AdminAuthGate'

interface AdminTopNavProps {
  title: string
  subtitle: string
  searchTerm: string
  onSearchChange: (value: string) => void
  onQuickAction?: () => void
  quickActionLabel?: string
  onOpenTour?: () => void
}

export function AdminTopNav({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  onQuickAction,
  quickActionLabel,
  onOpenTour,
}: AdminTopNavProps) {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-base font-extrabold text-slate-100 tracking-tight">{title}</h1>
        <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Universal Search Bar */}
        <div className="relative w-64 md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises, users, plans..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all font-medium"
          />
        </div>

        {/* Persistent Guided Tour Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            title="Interactive Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tour Guide</span>
          </button>
        )}

        {/* Database Connected Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Synced</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
        </div>

        {/* Dynamic Action CTA */}
        {onQuickAction && quickActionLabel && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onQuickAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 glow-button text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{quickActionLabel}</span>
          </motion.button>
        )}

        {/* Secure Admin Logout Button */}
        <button
          onClick={logoutAdminSession}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-800 hover:border-rose-900/60 text-slate-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          title="Sign out of Admin Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
