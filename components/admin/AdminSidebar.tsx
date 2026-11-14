'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Award,
  Activity,
  Utensils,
  Users,
  Bot,
  RotateCcw,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { ADMIN_COPY } from '@/lib/admin-copy'

export type AdminTab = 'overview' | 'badges' | 'stretches' | 'nutrition' | 'users' | 'ai-prompts'

interface AdminSidebarProps {
  currentTab: AdminTab
  onSelectTab: (tab: AdminTab) => void
  badgesCount: number
  stretchesCount: number
  foodsCount: number
  usersCount: number
  aiChipsCount: number
  onResetSeeds: () => void
  onQuickAdd?: () => void
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  badgesCount,
  stretchesCount,
  foodsCount,
  usersCount,
  aiChipsCount,
  onResetSeeds,
  onQuickAdd,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      labelEn: ADMIN_COPY.nav.overview.label.en,
      labelGu: ADMIN_COPY.nav.overview.label.gu,
      sublabelEn: ADMIN_COPY.nav.overview.sublabel.en,
      icon: Home,
      countBadge: 'Live',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'stretches' as AdminTab,
      labelEn: ADMIN_COPY.nav.stretches.label.en,
      labelGu: ADMIN_COPY.nav.stretches.label.gu,
      sublabelEn: ADMIN_COPY.nav.stretches.sublabel.en,
      icon: Activity,
      countBadge: String(stretchesCount),
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'nutrition' as AdminTab,
      labelEn: ADMIN_COPY.nav.nutrition.label.en,
      labelGu: ADMIN_COPY.nav.nutrition.label.gu,
      sublabelEn: ADMIN_COPY.nav.nutrition.sublabel.en,
      icon: Utensils,
      countBadge: String(foodsCount),
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'badges' as AdminTab,
      labelEn: ADMIN_COPY.nav.badges.label.en,
      labelGu: ADMIN_COPY.nav.badges.label.gu,
      sublabelEn: ADMIN_COPY.nav.badges.sublabel.en,
      icon: Award,
      countBadge: String(badgesCount),
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      id: 'ai-prompts' as AdminTab,
      labelEn: ADMIN_COPY.nav.aiPrompts.label.en,
      labelGu: ADMIN_COPY.nav.aiPrompts.label.gu,
      sublabelEn: ADMIN_COPY.nav.aiPrompts.sublabel.en,
      icon: Bot,
      countBadge: String(aiChipsCount),
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    {
      id: 'users' as AdminTab,
      labelEn: ADMIN_COPY.nav.users.label.en,
      labelGu: ADMIN_COPY.nav.users.label.gu,
      sublabelEn: ADMIN_COPY.nav.users.sublabel.en,
      icon: Users,
      countBadge: String(usersCount),
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
  ]

  return (
    <aside className="w-80 bg-slate-950/70 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-cyan-500/25">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-100 tracking-tight">
                {ADMIN_COPY.brand.title.en}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">
                {ADMIN_COPY.brand.badge.en}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {ADMIN_COPY.brand.tagline.en} &bull; {ADMIN_COPY.brand.tagline.gu}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      {onQuickAdd ? (
        <div className="p-4 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onQuickAdd}
            className="w-full py-3 px-4 rounded-2xl glow-button flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-black uppercase tracking-wider">
                {ADMIN_COPY.topNav.addItem.en}
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {ADMIN_COPY.topNav.addItem.gu}
              </span>
            </div>
          </motion.button>
        </div>
      ) : null}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <div className="px-2 pb-1.5 flex items-baseline justify-between text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
          <span>{ADMIN_COPY.nav.sectionTitle.en}</span>
          <span className="text-[10px] text-slate-600 normal-case">{ADMIN_COPY.nav.sectionTitle.gu}</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTab(item.id)}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer relative border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/50'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className={`text-sm tracking-tight ${isActive ? 'text-white font-black' : 'text-slate-200 font-bold'}`}>
                    {item.labelEn}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {item.labelGu}
                  </div>
                </div>
              </div>

              {/* Counter Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${item.badgeColor}`}
              >
                {item.countBadge}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Footer Controls & System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
        {/* Connected Indicator */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col leading-tight">
              <span>{ADMIN_COPY.nav.connected.en}</span>
              <span className="text-[10px] text-slate-500 font-normal">{ADMIN_COPY.nav.connected.gu}</span>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Wipe Clean 0 Data Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (confirm('Wipe all local data and start completely fresh with 0 items? / બધો ડેટા સાફ કરવો છે?')) {
              localStorage.removeItem('gotall_admin_badges')
              localStorage.removeItem('gotall_admin_stretches')
              localStorage.removeItem('gotall_admin_categories')
              localStorage.removeItem('gotall_admin_category_questions')
              localStorage.removeItem('gotall_admin_foods')
              localStorage.removeItem('gotall_admin_users')
              localStorage.removeItem('gotall_admin_aichips')
              window.location.reload()
            }
          }}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-800 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{ADMIN_COPY.nav.wipeClean.en}</span>
        </motion.button>
      </div>
    </aside>
  )
}
