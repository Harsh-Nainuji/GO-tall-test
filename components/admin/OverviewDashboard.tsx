'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Activity,
  Utensils,
  Award,
  HardDrive,
  RefreshCw,
  Plus,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Check,
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
    <div className="space-y-7 pb-16 max-w-6xl mx-auto">
      {/* 1. Header: Clean, Simple, Welcome Banner */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              GoTall Studio Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live &bull; 0 Dummy Data
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage exercises, clinical nutrition, app members, and cloud media in one place.
          </p>
        </div>

        {/* Quick Excel / CSV Bulk Upload Shortcut */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('stretches')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Workouts</span>
          </button>

          <button
            onClick={() => onNavigateTab('nutrition')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload Foods</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Live Metric Cards (100% Real Live Database Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Members */}
        <div
          onClick={() => onNavigateTab('users')}
          className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              App Members
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {users.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {users.length === 0 ? 'No users registered yet' : `${users.length} real user profiles`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>View Members</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Active Exercises */}
        <div
          onClick={() => onNavigateTab('stretches')}
          className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exercises
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stretches.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {stretches.length === 0 ? 'Database empty (ready to add)' : `${stretches.length} routines live`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Manage Exercises</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Clinical Foods */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Foods &amp; Nutrition
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {foods.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {foods.length === 0 ? 'Database empty (ready to add)' : `${foods.length} verified foods`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Manage Foods</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Supabase Live Storage */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cloud Media Storage
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {storageData.usedMB.toFixed(1)} <span className="text-sm font-bold text-slate-400">MB</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {storageData.totalFiles} files in Supabase ({storageData.percentUsed}% of 1 GB)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free 1 GB Tier Active
            </span>
            <button
              onClick={refreshStorage}
              disabled={isLoadingStorage}
              className="text-slate-400 hover:text-slate-700"
              title="Refresh Storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Simple Actions: Giant, Easy-to-Use 1-Click Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            What would you like to manage?
          </h3>
          <p className="text-xs text-slate-500">
            Select any section below to add, edit, or bulk upload content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action 1: Exercises */}
          <div
            onClick={() => onNavigateTab('stretches')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Activity className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Daily Exercises &amp; Stretches
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add stretching routines with video/image guides, or bulk upload hundreds of exercises at once using an Excel or CSV template.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-blue-600">
                <span>Open Exercises Catalog ({stretches.length} items) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 2: Foods */}
          <div
            onClick={() => onNavigateTab('nutrition')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Utensils className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Food &amp; Nutrition Catalog
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add verified foods with calories, protein, and bone minerals (Calcium, Zinc, Vitamin D3). Supports 50 MB bulk Excel/CSV file upload.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-emerald-700">
                <span>Open Nutrition Catalog ({foods.length} items) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 3: App Members */}
          <div
            onClick={() => onNavigateTab('users')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Users className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  App Members &amp; Accounts
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect real registered users, review Tanner-Whitehouse height targets, grant VIP Pro access, or export user data.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-purple-600">
                <span>Open Member CRM ({users.length} registered) &rarr;</span>
              </div>
            </div>
          </div>

          {/* Action 4: Milestones & Badges */}
          <div
            onClick={() => onNavigateTab('badges')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xl transition-all duration-300 cursor-pointer group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center flex-none group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Award className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Milestones &amp; Achievement Badges
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure motivation trophies, discipline streak medals, and XP point rewards teenagers earn in the mobile app.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-amber-700">
                <span>Manage Badges ({badges.length} items) &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Supabase Storage Card (Clean, Simple, Clear) */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Live Supabase Storage Capacity
              </h4>
              <p className="text-xs text-slate-500">
                Storage bucket <code className="text-cyan-700 font-bold bg-cyan-50 px-1 py-0.5 rounded">exercise-media</code> for workout videos &amp; food pictures.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard/project/xoxhmugmtzscmjlbpfuj/storage/buckets/exercise-media"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>Open in Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Storage Bar */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">
              {storageData.usedMB.toFixed(2)} MB Used of {storageData.limitMB} MB
            </span>
            <span className="text-emerald-700 font-black">
              {(storageData.limitMB - storageData.usedMB).toFixed(1)} MB Free
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.max(1, storageData.percentUsed)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
            <div className="flex items-center gap-3">
              <span>{storageData.breakdown.images} Photos</span>
              <span>&bull;</span>
              <span>{storageData.breakdown.videos} Videos</span>
              <span>&bull;</span>
              <span>{storageData.totalFiles} Total Files</span>
            </div>
            <span className="text-slate-400">
              Max Bulk Upload Size: <strong>50 MB</strong> per file
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
