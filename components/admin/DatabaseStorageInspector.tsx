'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  HardDrive,
  Users,
  Activity,
  Utensils,
  Award,
  Moon,
  RefreshCw,
  ExternalLink,
  FileImage,
  FileVideo,
  Film,
  Search,
  CheckCircle2,
  AlertTriangle,
  Folder,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { formatBytes } from '@/lib/supabase'

interface StorageFile {
  name: string
  folder: string
  size: number
  created_at?: string
  mimetype?: string
  url: string
}

interface TableTelemetry {
  count: number
  estimatedBytes: number
}

interface TelemetryData {
  db_size_bytes: number
  db_limit_bytes: number
  media_total_bytes: number
  media_limit_bytes: number
  media_file_count: number
  users_count: number
  files: StorageFile[]
  tables: {
    profiles: TableTelemetry
    stretches: TableTelemetry
    meals: TableTelemetry
    achievements: TableTelemetry
    sleep_logs: TableTelemetry
  }
  supabase_url: string
}

export function DatabaseStorageInspector() {
  const [data, setData] = useState<TelemetryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')

  const fetchTelemetry = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026'
          : 'GoTall@Admin2026'

      const res = await fetch('/api/admin/storage-usage', {
        headers: {
          'x-admin-token': token,
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load storage telemetry (${res.status})`)
      }

      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Error fetching telemetry')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTelemetry()
  }, [])

  const filteredFiles = (data?.files || []).filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || f.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const dbUsedMB = data ? (data.db_size_bytes / (1024 * 1024)).toFixed(1) : '0'
  const dbLimitMB = data ? Math.round(data.db_limit_bytes / (1024 * 1024)) : 500
  const dbPercent = data
    ? Math.min(100, Math.round((data.db_size_bytes / data.db_limit_bytes) * 100))
    : 0

  const mediaUsedMB = data ? (data.media_total_bytes / (1024 * 1024)).toFixed(1) : '0'
  const mediaLimitMB = data ? Math.round(data.media_limit_bytes / (1024 * 1024)) : 1024
  const mediaPercent = data
    ? Math.min(100, Math.round((data.media_total_bytes / data.media_limit_bytes) * 100))
    : 0

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Summary */}
      <div className="glass p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                <span>Database & File Storage Health</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold uppercase">
                  Live Supabase
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Real-time usage breakdown of PostgreSQL database tables, member records, and uploaded exercise media.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={fetchTelemetry}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <a
            href="https://supabase.com/dashboard/project/xoxhmugmtzscmjlbpfuj"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
          >
            <span>Supabase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Capacity Meters (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PostgreSQL Database Storage Meter */}
        <div className="glass p-6 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Database className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                  PostgreSQL Database Capacity
                </h3>
                <p className="text-xs text-slate-400">
                  Total system catalog + row storage across all tables
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-cyan-300">{dbPercent}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">
                {dbUsedMB} MB <span className="text-slate-500">used</span>
              </span>
              <span className="text-slate-400">{dbLimitMB} MB Quota</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, dbPercent)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-sm shadow-cyan-500/50"
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
              <span>Remaining Free Tier Space:</span>
              <span className="font-bold text-slate-200">
                {(dbLimitMB - Number(dbUsedMB)).toFixed(1)} MB available
              </span>
            </div>
          </div>
        </div>

        {/* Supabase Bucket Media Storage Meter */}
        <div className="glass p-6 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <HardDrive className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                  Supabase File Bucket Capacity
                </h3>
                <p className="text-xs text-slate-400">
                  Stored in bucket: <code className="text-violet-300 font-mono">exercise-media</code>
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-violet-300">{mediaPercent}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">
                {mediaUsedMB} MB <span className="text-slate-500">used</span>
              </span>
              <span className="text-slate-400">{mediaLimitMB} MB Quota</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, mediaPercent)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-sm shadow-violet-500/50"
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
              <span>Total Uploaded Files:</span>
              <span className="font-bold text-slate-200">
                {data?.media_file_count || 0} media assets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Table Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Database Tables & Rows Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            PostgreSQL public schema
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Profiles */}
          <div className="glass p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-100">
                {data?.tables.profiles.count ?? 0}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-200">profiles</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              User biometrics, trajectories & auth links
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-400">
              ~{formatBytes(data?.tables.profiles.estimatedBytes ?? 0)}
            </div>
          </div>

          {/* Stretches */}
          <div className="glass p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-100">
                {data?.tables.stretches.count ?? 0}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-200">stretches</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Exercise catalog, instructions & media
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-400">
              ~{formatBytes(data?.tables.stretches.estimatedBytes ?? 0)}
            </div>
          </div>

          {/* Meals */}
          <div className="glass p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-100">
                {data?.tables.meals.count ?? 0}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-200">meals</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Food catalog & user meal intake logs
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">
              ~{formatBytes(data?.tables.meals.estimatedBytes ?? 0)}
            </div>
          </div>

          {/* Badges / Achievements */}
          <div className="glass p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-100">
                {data?.tables.achievements.count ?? 0}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-200">achievements</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Gamified trophies & milestone targets
            </div>
            <div className="mt-2 text-[10px] font-mono text-amber-400">
              ~{formatBytes(data?.tables.achievements.estimatedBytes ?? 0)}
            </div>
          </div>

          {/* Sleep Logs */}
          <div className="glass p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-100">
                {data?.tables.sleep_logs.count ?? 0}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-200">sleep_logs</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Circadian sleep & deep rest records
            </div>
            <div className="mt-2 text-[10px] font-mono text-violet-400">
              ~{formatBytes(data?.tables.sleep_logs.estimatedBytes ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Storage Bucket Files Explorer */}
      <div className="glass p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-violet-400" />
              <span>Storage Bucket Explorer: exercise-media</span>
            </h2>
            <p className="text-xs text-slate-400">
              Files physically stored in Supabase Cloud Storage. Directly served to mobile clients via CDN.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Folder filter buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedFolder('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFolder === 'all'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({data?.files.length ?? 0})
              </button>
              <button
                onClick={() => setSelectedFolder('stretches')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFolder === 'stretches'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stretches (
                {(data?.files || []).filter((f) => f.folder === 'stretches').length}
                )
              </button>
              <button
                onClick={() => setSelectedFolder('foods')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFolder === 'foods'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Foods (
                {(data?.files || []).filter((f) => f.folder === 'foods').length}
                )
              </button>
              <button
                onClick={() => setSelectedFolder('badges')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFolder === 'badges'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Badges (
                {(data?.files || []).filter((f) => f.folder === 'badges').length}
                )
              </button>
            </div>

            {/* File search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-44"
              />
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset Preview</th>
                <th className="py-3 px-4">Filename & Path</th>
                <th className="py-3 px-4">Folder</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">MIME Type</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Folder className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-slate-300">No media files found in bucket</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded exercises, foods, or badges will appear here with live CDN links.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file, idx) => {
                  const isImage = file.mimetype?.startsWith('image') || file.name.match(/\.(png|jpg|jpeg|webp)$/i)
                  const isVideo = file.mimetype?.startsWith('video') || file.name.match(/\.(mp4|webm)$/i)
                  const isGif = file.name.endsWith('.gif')

                  return (
                    <tr
                      key={`${file.folder}-${file.name}-${idx}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : isVideo ? (
                            <FileVideo className="w-5 h-5 text-cyan-400" />
                          ) : isGif ? (
                            <Film className="w-5 h-5 text-amber-400" />
                          ) : (
                            <FileImage className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 max-w-xs truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                          exercise-media/{file.folder}/{file.name}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                          {file.folder}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        {formatBytes(file.size)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                          {file.mimetype || 'binary'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold transition-all"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
