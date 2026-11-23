'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Award,
  Activity,
  Utensils,
  Users,
  Database,
  RotateCcw,
  CheckCircle2,
  Plus,
  CreditCard,
  DollarSign,
} from 'lucide-react'

export type AdminTab =
  | 'overview'
  | 'stretches'
  | 'nutrition'
  | 'badges'
  | 'plans'
  | 'revenue'
  | 'users'
  | 'storage'

interface AdminSidebarProps {
  currentTab: AdminTab
  onSelectTab: (tab: AdminTab) => void
  badgesCount: number
  stretchesCount: number
  foodsCount: number
  usersCount: number
  aiChipsCount: number
  plansCount?: number
  paymentsCount?: number
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
  plansCount = 4,
  paymentsCount = 0,
  onResetSeeds,
  onQuickAdd,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Overview',
      sublabel: 'Executive Metrics & System Health',
      icon: Home,
      countBadge: 'Live',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'stretches' as AdminTab,
      label: 'Workouts & Stretches',
      sublabel: 'Biomechanical Exercise Catalog',
      icon: Activity,
      countBadge: String(stretchesCount),
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'nutrition' as AdminTab,
      label: 'Clinical Nutrition',
      sublabel: 'Macronutrients & Bone Mineral Matrix',
      icon: Utensils,
      countBadge: String(foodsCount),
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'badges' as AdminTab,
      label: 'Badges & XP',
      sublabel: 'Habit Milestones & Gamification',
      icon: Award,
      countBadge: String(badgesCount),
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      id: 'plans' as AdminTab,
      label: 'Subscription Plans',
      sublabel: 'Quotas, Feature Flags & Paywall Tiers',
      icon: CreditCard,
      countBadge: String(plansCount),
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    {
      id: 'revenue' as AdminTab,
      label: 'Revenue & Billing',
      sublabel: 'MRR, Paying Users & Transactions',
      icon: DollarSign,
      countBadge: paymentsCount > 0 ? String(paymentsCount) : 'Active',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'users' as AdminTab,
      label: 'Users & CRM',
      sublabel: 'Stature Profiles & Subscribers',
      icon: Users,
      countBadge: String(usersCount),
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
    {
      id: 'storage' as AdminTab,
      label: 'Database & Media',
      sublabel: 'Supabase Storage & Tables',
      icon: Database,
      countBadge: 'Cloud',
      badgeColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    },
  ]

  return (
    <aside className="w-72 min-w-[18rem] shrink-0 flex-shrink-0 bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-cyan-500/20">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-100 tracking-tight">
                GoTall Admin
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/25 text-[9.5px] font-extrabold text-cyan-300 uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Stature Protocol &amp; System Studio
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      {onQuickAdd && (
        <div className="p-3 pb-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={onQuickAdd}
            className="w-full py-2.5 px-3 rounded-xl glow-button flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create New Item</span>
          </motion.button>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <div className="px-2 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-widest text-slate-500">
          Management Console
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTab(item.id)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer relative border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/50'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <div
                    className={`text-xs tracking-tight ${
                      isActive ? 'text-white font-extrabold' : 'text-slate-200 font-semibold'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {/* Counter Badge */}
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}
              >
                {item.countBadge}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Footer Controls & System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-medium">Database Synced</span>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (confirm('Reset workspace data to original seed baseline?')) {
              onResetSeeds()
            }
          }}
          className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Seeds</span>
        </motion.button>
      </div>
    </aside>
  )
}
