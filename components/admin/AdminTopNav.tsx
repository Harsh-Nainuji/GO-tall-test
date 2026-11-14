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
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Universal Search Bar */}
        <div className="relative w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type here to search anything..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs"
          />
        </div>

        {/* Persistent Guided Tour Button */}
        {onOpenTour && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-2xl shadow-2xs transition-colors cursor-pointer"
            title="Watch Admin Tutorial"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>🎬 Tour</span>
          </motion.button>
        )}

        {/* Database Connected Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Synced</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
        </div>

        {/* Secure Admin Logout Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={logoutAdminSession}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-600 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          title="Sign out of Admin Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </motion.button>

        {/* Action Button: Strictly Color-Coded Vibrant Emerald Green with Framer Motion Micro-interaction */}
        {onQuickAction && quickActionLabel && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onQuickAction}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{quickActionLabel}</span>
          </motion.button>
        )}
      </div>
    </header>
  )
}

