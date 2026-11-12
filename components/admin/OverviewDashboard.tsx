'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Award,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Utensils,
  Plus,
  IndianRupee,
} from 'lucide-react'
import { AchievementBadge, SpinalStretch, FoodItem, UserBiometricProfile } from '@/lib/admin-store'

interface OverviewDashboardProps {
  badges: AchievementBadge[]
  stretches: SpinalStretch[]
  foods: FoodItem[]
  users: UserBiometricProfile[]
  onNavigateTab: (tab: any) => void
}

export function OverviewDashboard({
  badges,
  stretches,
  foods,
  users,
  onNavigateTab,
}: OverviewDashboardProps) {
  const activeBadgesCount = badges.filter((b) => b.active).length
  const activeStretchesCount = stretches.filter((s) => s.active).length
  const activeFoodsCount = foods.filter((f) => f.active).length

  // Simplified friendly steps for non-technical clients
  const funnelStages = [
    { stage: '1. Started Quiz (Gender & Age)', count: 12480, pct: 100, drop: '0%' },
    { stage: '2. Entered Current Height', count: 11850, pct: 94.9, drop: '-5.1%' },
    { stage: '3. Entered Parents Height', count: 11210, pct: 89.8, drop: '-5.1%' },
    { stage: '4. Answered Sleep & Diet', count: 10780, pct: 86.4, drop: '-3.4%' },
    { stage: '5. Viewed Height Forecast Result', count: 10240, pct: 82.1, drop: '-4.3%' },
    { stage: '6. Subscribed to Paid Plan', count: 3480, pct: 27.8, drop: '-54.3%' },
  ]

  const ageCohort = [
    { range: 'Ages 12–14 (Fast Growing Years)', count: '2,246 teenagers', pct: 18, color: 'bg-emerald-500' },
    { range: 'Ages 15–17 (Final Growth Stage)', count: '5,491 teenagers', pct: 44, color: 'bg-blue-600' },
    { range: 'Ages 18–20 (Last Growth Millimeters)', count: '3,370 young adults', pct: 27, color: 'bg-indigo-600' },
    { range: 'Ages 21+ (Spine Stretch & Posture Focus)', count: '1,373 adults', pct: 11, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-8 pb-14">
      {/* 4 Oversized Key Number Cards with Framer Motion hover & spring */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Total Members */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total App Members
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">12,480</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+14% new users this week</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Free &amp; Paid combined</span>
            <span className="font-bold text-slate-700">100% active</span>
          </div>
        </motion.div>

        {/* Card 2: Monthly Money */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Earnings (INR)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">₹1,86,500</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>3,480 Paying Subscribers</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Play Store &amp; App Store</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Growing Fast
            </span>
          </div>
        </motion.div>

        {/* Card 3: Exercises Completed */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stretches Done by Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">14,890</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>4,892 active streaks</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Active catalog:</span>
            <span className="font-bold text-slate-700">{activeStretchesCount} exercises live</span>
          </div>
        </motion.div>

        {/* Card 4: AI Questions Answered */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI Helper Questions Answered
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">3,412</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>99.8% safety score</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Fast instant buttons:</span>
            <span className="font-bold text-slate-700">1-tap replies</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Visual Funnel & Age Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Quiz Steps (Oversized, simple progress bars) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">How Users Join &amp; Finish Quiz</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Shows where people answer questions and who buys the subscription
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Live Progress
            </span>
          </div>

          <div className="space-y-4">
            {funnelStages.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-900 text-sm">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900 font-extrabold">{item.count.toLocaleString()} people</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px]">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teenager Age Groups Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">User Age Groups</h2>
              <span className="text-xs font-bold text-slate-400">Who uses the app</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Most users are teenagers looking to maximize height before growth plates close.
            </p>

            <div className="space-y-4">
              {ageCohort.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{c.range}</span>
                    <span className="text-slate-900 font-black">{c.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mt-2">
                    <div className={`${c.color} h-2 rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{c.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Age 21+ users get honest spinal stretch notices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump Action Cards: Giant Buttons */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900">What do you want to manage today?</h3>
          <p className="text-xs text-slate-500">Tap any button to open that section</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Exercises */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('stretches')}
            className="p-5 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-600 shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-base font-extrabold text-slate-900">Manage Exercises</div>
            <p className="text-xs text-slate-500 mt-1">Add, edit, or remove daily stretches</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Open Exercises</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Food & Meals */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('nutrition')}
            className="p-5 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-600 shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Utensils className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-base font-extrabold text-slate-900">Manage Food &amp; Meals</div>
            <p className="text-xs text-slate-500 mt-1">Edit Indian food presets &amp; protein</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>Open Foods</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Rewards & Badges */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('badges')}
            className="p-5 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-600 shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-base font-extrabold text-slate-900">Manage Rewards</div>
            <p className="text-xs text-slate-500 mt-1">Configure badges and XP points</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-600">
              <span>Open Rewards</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Members & VIP */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('users')}
            className="p-5 rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-600 shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-base font-extrabold text-slate-900">View App Members</div>
            <p className="text-xs text-slate-500 mt-1">Check users, grant VIP, or delete data</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600">
              <span>Open Members</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
