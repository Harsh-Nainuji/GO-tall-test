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
  ExternalLink,
  Plus,
} from 'lucide-react'

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
  // Ultra-simple visual navigation items for non-tech operators
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Home',
      sublabel: 'Numbers at a glance',
      icon: Home,
      countBadge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'stretches' as AdminTab,
      label: 'Exercises',
      sublabel: 'Daily stretches & workout',
      icon: Activity,
      countBadge: String(stretchesCount),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'nutrition' as AdminTab,
      label: 'Food & Meals',
      sublabel: 'Indian food & protein',
      icon: Utensils,
      countBadge: String(foodsCount),
      badgeColor: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      id: 'badges' as AdminTab,
      label: 'Rewards & Badges',
      sublabel: 'Trophies & points',
      icon: Award,
      countBadge: String(badgesCount),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'ai-prompts' as AdminTab,
      label: 'AI Helper',
      sublabel: 'Instant answer buttons',
      icon: Bot,
      countBadge: String(aiChipsCount),
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      id: 'users' as AdminTab,
      label: 'App Members',
      sublabel: 'Users & VIP access',
      icon: Users,
      countBadge: String(usersCount),
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    },
  ]

  return (
    <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none shadow-sm z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/25">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight">GoTall</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                Manager
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Simple Control Center</p>
          </div>
        </div>
      </div>

      {/* Primary Action Button (Giant '+' for Add) */}
      {onQuickAdd ? (
        <div className="p-4 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={onQuickAdd}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>+ Add New Item</span>
          </motion.button>
        </div>
      ) : null}

      {/* Large, Highly Legible Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <div className="px-2 pb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          Main Sections
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTab(item.id)}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : 'text-slate-700 hover:bg-slate-100/90 font-medium'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className={`text-base tracking-tight ${isActive ? 'text-white font-extrabold' : 'text-slate-900 font-bold'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {/* Counter Badge */}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                  isActive
                    ? 'bg-white/20 text-white border-white/30'
                    : item.badgeColor
                }`}
              >
                {item.countBadge}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Footer Controls & System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {/* Connected Indicator */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>App Connected &amp; Live</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>

        {/* Emergency Reset to Default button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onResetSeeds}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </motion.button>
      </div>
    </aside>
  )
}
