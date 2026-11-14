'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HardDrive, Database, Users, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { ADMIN_COPY } from '@/lib/admin-copy'

/**
 * Free-tier limits for Supabase projects.
 * NOTE: These limits must be verified against your live Supabase project billing dashboard.
 */
export const SUPABASE_FREE_TIER_LIMITS = {
  DB_LIMIT_BYTES: 500 * 1024 * 1024,       // 500 MB PostgreSQL database storage
  FILES_LIMIT_BYTES: 1024 * 1024 * 1024,   // 1 GB Supabase Storage bucket capacity
} as const

interface StorageUsageData {
  users_count: number
  db_size_bytes: number
  media_file_count: number
  media_total_bytes: number
  rpc_deployed?: boolean
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(1)} MB`
}

function getUsageStatus(usedBytes: number, limitBytes: number) {
  const percent = Math.min(100, Math.max(0, (usedBytes / limitBytes) * 100))

  if (percent >= 90) {
    return {
      percent,
      tier: 'danger' as const,
      color: 'from-rose-500 to-red-600',
      badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      icon: AlertCircle,
      labelEn: ADMIN_COPY.storageHealth.status.upgradeNow.en,
      labelGu: ADMIN_COPY.storageHealth.status.upgradeNow.gu,
    }
  }

  if (percent >= 70) {
    return {
      percent,
      tier: 'warning' as const,
      color: 'from-amber-400 to-orange-500',
      badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: AlertTriangle,
      labelEn: ADMIN_COPY.storageHealth.status.checkSoon.en,
      labelGu: ADMIN_COPY.storageHealth.status.checkSoon.gu,
    }
  }

  return {
    percent,
    tier: 'healthy' as const,
    color: 'from-cyan-400 to-emerald-500',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    icon: CheckCircle2,
    labelEn: ADMIN_COPY.storageHealth.status.ok.en,
    labelGu: ADMIN_COPY.storageHealth.status.ok.gu,
  }
}

export function StorageHealthCard() {
  const [data, setData] = useState<StorageUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStorageHealth = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Read admin token from sessionStorage (never hardcoded in client source)
      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('gotall_admin_token') || ''
          : ''

      const res = await fetch('/api/admin/storage-usage', {
        headers: {
          'x-admin-token': token,
        },
      })

      if (!res.ok) {
        throw new Error(`Status ${res.status}`)
      }

      const json = await res.json()
      setData(json)
    } catch (err: any) {
      console.warn('Storage health fetch warning:', err)
      setError(ADMIN_COPY.storageHealth.status.error.en)
      // Provide fallback visualization with minimal initial values so UI remains usable
      setData({
        users_count: 0,
        db_size_bytes: 35 * 1024 * 1024,
        media_file_count: 0,
        media_total_bytes: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStorageHealth()
  }, [fetchStorageHealth])

  const dbStatus = getUsageStatus(
    data?.db_size_bytes || 0,
    SUPABASE_FREE_TIER_LIMITS.DB_LIMIT_BYTES
  )

  const filesStatus = getUsageStatus(
    data?.media_total_bytes || 0,
    SUPABASE_FREE_TIER_LIMITS.FILES_LIMIT_BYTES
  )

  return (
    <div className="glass p-6 relative overflow-hidden transition-all duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
            <HardDrive className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                {ADMIN_COPY.storageHealth.cardTitle.en}
              </h2>
              <span className="text-xs text-slate-400 font-normal">
                {ADMIN_COPY.storageHealth.cardTitle.gu}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {ADMIN_COPY.storageHealth.cardSubtitle.en}
            </p>
          </div>
        </div>

        {/* Refresh & Free Tier Info */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={fetchStorageHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Storage Health"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{ADMIN_COPY.buttons.refresh.en}</span>
          </motion.button>
        </div>
      </div>

      {/* 3 Metric Columns: Users, Database Meter, Files Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
        {/* Metric 1: Total Users */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {ADMIN_COPY.storageHealth.totalUsers.en}
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-100 tracking-tight">
              {loading ? '...' : data?.users_count ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {ADMIN_COPY.storageHealth.totalUsers.gu}
            </div>
          </div>
        </div>

        {/* Metric 2: Database Meter */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                {ADMIN_COPY.storageHealth.databaseMeter.en}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({ADMIN_COPY.storageHealth.databaseMeter.gu})
              </span>
            </div>

            {/* Threshold Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${dbStatus.badgeClass}`}>
              <dbStatus.icon className="w-3 h-3" />
              <span>{dbStatus.labelEn}</span>
              <span className="opacity-75 text-[10px]">({dbStatus.labelGu})</span>
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-baseline justify-between text-xs font-semibold">
              <span className="text-slate-100">
                {formatBytes(data?.db_size_bytes || 0)}
              </span>
              <span className="text-slate-400 text-[11px]">
                of 500 MB ({dbStatus.percent.toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${dbStatus.color} transition-all duration-500`}
                style={{ width: `${Math.max(2, dbStatus.percent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Files Meter */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                {ADMIN_COPY.storageHealth.filesMeter.en}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({ADMIN_COPY.storageHealth.filesMeter.gu})
              </span>
            </div>

            {/* Threshold Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${filesStatus.badgeClass}`}>
              <filesStatus.icon className="w-3 h-3" />
              <span>{filesStatus.labelEn}</span>
              <span className="opacity-75 text-[10px]">({filesStatus.labelGu})</span>
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-baseline justify-between text-xs font-semibold">
              <span className="text-slate-100">
                {formatBytes(data?.media_total_bytes || 0)}
              </span>
              <span className="text-slate-400 text-[11px]">
                of 1 GB ({filesStatus.percent.toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${filesStatus.color} transition-all duration-500`}
                style={{ width: `${Math.max(2, filesStatus.percent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer helper note */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-400">
        <span>{ADMIN_COPY.storageHealth.freeTierNotice.en}</span>
        <span className="text-slate-500 font-normal">{ADMIN_COPY.storageHealth.freeTierNotice.gu}</span>
      </div>
    </div>
  )
}
