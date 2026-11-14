'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, CheckCircle2, Sparkles, LogOut } from 'lucide-react'
import { logoutAdminSession } from './AdminAuthGate'
import { ADMIN_COPY } from '@/lib/admin-copy'

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
    <header className="h-20 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div>
        <h1 className="text-xl font-black text-slate-100 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Universal Search Bar */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={ADMIN_COPY.topNav.searchPlaceholder.en}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 transition-all font-medium shadow-inner"
          />
        </div>

        {/* Persistent Guided Tour Button */}
        {onOpenTour && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 text-cyan-300 text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            title="Watch Admin Tutorial"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex flex-col text-left leading-tight">
              <span>{ADMIN_COPY.topNav.tourBtn.en}</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">{ADMIN_COPY.topNav.tourBtn.gu}</span>
            </div>
          </motion.button>
        )}

        {/* Database Connected Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col leading-tight">
            <span>{ADMIN_COPY.topNav.liveSynced.en}</span>
            <span className="text-[10px] text-slate-500 font-normal">{ADMIN_COPY.topNav.liveSynced.gu}</span>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
        </div>

        {/* Secure Admin Logout Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={logoutAdminSession}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 text-slate-400 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          title="Sign out of Admin Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <div className="flex flex-col text-left leading-tight">
            <span>{ADMIN_COPY.topNav.signOut.en}</span>
            <span className="text-[10px] text-slate-500 font-normal">{ADMIN_COPY.topNav.signOut.gu}</span>
          </div>
        </motion.button>

        {/* Dynamic Action CTA */}
        {onQuickAction && quickActionLabel && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={onQuickAction}
            className="flex items-center gap-2 px-4 py-2.5 glow-button text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{quickActionLabel}</span>
          </motion.button>
        )}
      </div>
    </header>
  )
}
