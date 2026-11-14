'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Activity,
  Utensils,
  Award,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  UploadCloud,
  ArrowRight,
} from 'lucide-react'
import {
  AchievementBadge,
  SpinalStretch,
  FoodItem,
  UserBiometricProfile,
} from '@/lib/admin-store'
import {
  getLiveStorageTelemetry,
  LiveStorageTelemetry,
} from '@/lib/supabase'
import { StorageHealthCard } from './StorageHealthCard'
import { ADMIN_COPY } from '@/lib/admin-copy'

interface OverviewDashboardProps {
  badges: AchievementBadge[]
  stretches: SpinalStretch[]
  foods: FoodItem[]
  users: UserBiometricProfile[]
  onNavigateTab: (tab: any) => void
  onClearDummyData?: () => void
  onResetSeeds?: () => void
}

export function OverviewDashboard({
  badges,
  stretches,
  foods,
  users,
  onNavigateTab,
}: OverviewDashboardProps) {
  // Live Supabase Storage Telemetry
  const [storageData, setStorageData] = useState<LiveStorageTelemetry>({
    totalBytes: 0,
    usedMB: 0,
    limitMB: 1024,
    percentUsed: 0,
    totalFiles: 0,
    status: 'Healthy',
    bucketName: 'exercise-media',
    breakdown: { images: 0, videos: 0, gifs: 0, others: 0 },
    files: [],
    lastChecked: 'Just now',
  })
  const [isLoadingStorage, setIsLoadingStorage] = useState(false)

  const refreshStorage = async () => {
    setIsLoadingStorage(true)
    try {
      const data = await getLiveStorageTelemetry()
      setStorageData(data)
    } catch (e) {
      console.warn('Storage fetch warning', e)
    } finally {
      setIsLoadingStorage(false)
    }
  }

  useEffect(() => {
    refreshStorage()
  }, [])

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* 1. Storage Health Card Placed Prominently at the Very Top */}
      <StorageHealthCard />

      {/* 2. Welcome Banner with Shortcuts */}
      <div className="glass p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-lg font-black text-slate-100 tracking-tight">
              {ADMIN_COPY.brand.title.en} Studio Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live &bull; 0 Dummy Data
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Manage exercises, clinical nutrition, app members, and cloud media in one place.
          </p>
          <p className="text-[11px] text-slate-500">
            કસરતો, ખોરાક, સભ્યો અને ક્લાઉડ મીડિયાનું સંચાલન એક જ જગ્યાએ કરો.
          </p>
        </div>

        {/* Quick Bulk Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onNavigateTab('stretches')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex flex-col text-left leading-tight">
              <span>{ADMIN_COPY.pages.stretches.bulkBtn.en}</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">{ADMIN_COPY.pages.stretches.bulkBtn.gu}</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onNavigateTab('nutrition')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col text-left leading-tight">
              <span>{ADMIN_COPY.pages.nutrition.bulkBtn.en}</span>
              <span className="text-[10px] text-emerald-400/80 font-normal">{ADMIN_COPY.pages.nutrition.bulkBtn.gu}</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* 3. Top 4 Live Metric Cards (100% Real Live Database Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Members */}
        <div
          onClick={() => onNavigateTab('users')}
          className="glass p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {ADMIN_COPY.nav.users.label.en}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {ADMIN_COPY.nav.users.label.gu}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {users.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {users.length === 0 ? 'No members registered yet' : `${users.length} real user profiles`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>View Members</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Active Exercises */}
        <div
          onClick={() => onNavigateTab('stretches')}
          className="glass p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {ADMIN_COPY.nav.stretches.label.en}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {ADMIN_COPY.nav.stretches.label.gu}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:bg-violet-500 group-hover:text-slate-950 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {stretches.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {stretches.length === 0 ? 'Catalog empty (ready to add)' : `${stretches.length} routines live`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-violet-400">
            <span>Manage Exercises</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Clinical Foods */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="glass p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {ADMIN_COPY.nav.nutrition.label.en}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {ADMIN_COPY.nav.nutrition.label.gu}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {foods.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {foods.length === 0 ? 'Catalog empty (ready to add)' : `${foods.length} verified foods`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Manage Foods</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Supabase Live Storage */}
        <div className="glass p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Media Storage
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                મીડિયા સ્ટોરેજ
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {storageData.usedMB.toFixed(1)} <span className="text-sm font-bold text-slate-400">MB</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {storageData.totalFiles} files ({storageData.percentUsed}% of 1 GB)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              1 GB Free Tier
            </span>
            <button
              onClick={refreshStorage}
              disabled={isLoadingStorage}
              className="text-slate-400 hover:text-white transition-colors"
              title="Refresh Storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Primary Simple Actions: Giant 1-Click Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-100 tracking-tight">
            What would you like to manage? / તમે શું મેનેજ કરવા માંગો છો?
          </h3>
          <p className="text-xs text-slate-400">
            Select any section below to add, edit, or bulk upload content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action 1: Exercises */}
          <div
            onClick={() => onNavigateTab('stretches')}
            className="glass p-6 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-sm">
              <Activity className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Daily Exercises &amp; Stretches
                  </h4>
                  <span className="text-[11px] text-slate-400">દૈનિક કસરતો અને સ્ટ્રેચિંગ</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Add stretching routines with video guides, or upload many routines at once using Excel or CSV.
              </p>
              <div className="mt-3 text-xs font-bold text-cyan-400">
                <span>Open Exercises Catalog ({stretches.length} items) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 2: Foods */}
          <div
            onClick={() => onNavigateTab('nutrition')}
            className="glass p-6 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-sm">
              <Utensils className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Food &amp; Nutrition Catalog
                  </h4>
                  <span className="text-[11px] text-slate-400">ખોરાક અને ભોજન યાદી</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Add verified foods with calories, protein, and bone minerals. Supports 50 MB bulk Excel/CSV upload.
              </p>
              <div className="mt-3 text-xs font-bold text-emerald-400">
                <span>Open Nutrition Catalog ({foods.length} items) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 3: App Members */}
          <div
            onClick={() => onNavigateTab('users')}
            className="glass p-6 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-13 h-13 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-violet-500 group-hover:text-slate-950 transition-all shadow-sm">
              <Users className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    App Members &amp; Accounts
                  </h4>
                  <span className="text-[11px] text-slate-400">એપ સભ્યો અને ખાતાઓ</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inspect real registered users, review height targets, grant VIP Pro access, or export data.
              </p>
              <div className="mt-3 text-xs font-bold text-violet-400">
                <span>Open Member CRM ({users.length} registered) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 4: Badges */}
          <div
            onClick={() => onNavigateTab('badges')}
            className="glass p-6 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-sm">
              <Award className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    Rewards &amp; Badges
                  </h4>
                  <span className="text-[11px] text-slate-400">ઇનામ અને સિદ્ધિ બેજ</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Configure trophies, streak medals, and XP points teenagers earn in the mobile app.
              </p>
              <div className="mt-3 text-xs font-bold text-amber-400">
                <span>Manage Badges ({badges.length} items) &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Direct Supabase Storage Link Box */}
      <div className="glass p-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Live Supabase Storage Bucket / સુપાબેસ સ્ટોરેજ
              </h4>
              <p className="text-xs text-slate-400">
                Bucket <code className="text-cyan-300 font-bold bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800/40">exercise-media</code> holds workout demonstration videos and food photography.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard/project/xoxhmugmtzscmjlbpfuj/storage/buckets/exercise-media"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <span>Open in Supabase</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>
    </div>
  )
}
