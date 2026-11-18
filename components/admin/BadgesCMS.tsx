'use client'

import React, { useState } from 'react'
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Upload,
  Loader2,
  Star,
  Zap,
  Trophy,
  Target,
  Lock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AchievementBadge } from '@/lib/admin-store'
import { ADMIN_COPY } from '@/lib/admin-copy'
import { uploadExerciseMedia } from '@/lib/supabase'

interface BadgesCMSProps {
  badges: AchievementBadge[]
  onUpdateBadges: (badges: AchievementBadge[]) => void
}

const TIER_CONFIG = {
  bronze:   { label: 'Bronze',   bg: 'bg-amber-900/50',  text: 'text-amber-300',  border: 'border-amber-700/60',  glow: 'shadow-amber-900/40',  icon: '🥉', gradient: 'from-amber-700 to-amber-500' },
  silver:   { label: 'Silver',   bg: 'bg-slate-800/80',  text: 'text-slate-200',  border: 'border-slate-500/60',  glow: 'shadow-slate-700/40',  icon: '🥈', gradient: 'from-slate-500 to-slate-300' },
  gold:     { label: 'Gold',     bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-400/50',  glow: 'shadow-amber-500/30',  icon: '🥇', gradient: 'from-amber-500 to-yellow-300' },
  platinum: { label: 'Platinum', bg: 'bg-cyan-500/15',   text: 'text-cyan-300',   border: 'border-cyan-400/50',   glow: 'shadow-cyan-500/30',   icon: '💎', gradient: 'from-cyan-400 to-blue-300' },
}

const CATEGORY_CONFIG = {
  streak:     { label: 'Streak',         icon: '🔥', color: 'text-orange-400' },
  stretches:  { label: 'Stretches',      icon: '🧘', color: 'text-cyan-400' },
  nutrition:  { label: 'Nutrition',      icon: '🥩', color: 'text-emerald-400' },
  sleep:      { label: 'Sleep',          icon: '🌙', color: 'text-violet-400' },
  biometrics: { label: 'Biometrics',     icon: '🧬', color: 'text-blue-400' },
}

const EMOJI_PRESETS = ['🏆', '🔥', '🧘', '🥩', '🌙', '⚡', '🧬', '💧', '🎯', '💪', '🌱', '⭐', '🛡️', '🔬', '🏅']

const TRIGGER_OPTIONS = [
  { value: 'streak_days',         label: 'streak_days',         desc: 'Consecutive active days' },
  { value: 'stretches_completed', label: 'stretches_completed', desc: 'Total sessions done' },
  { value: 'protein_target_hit',  label: 'protein_target_hit',  desc: 'Days protein goal met' },
  { value: 'deep_sleep_hours',    label: 'deep_sleep_hours',    desc: 'Hours of deep sleep' },
  { value: 'water_quota_met',     label: 'water_quota_met',     desc: 'Days water goal met' },
  { value: 'quiz_completed',      label: 'quiz_completed',      desc: 'Assessment completed' },
]

export function BadgesCMS({ badges, onUpdateBadges }: BadgesCMSProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<AchievementBadge | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIcon, setFormIcon] = useState('🏆')
  const [formIconUrl, setFormIconUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formCategory, setFormCategory] = useState<AchievementBadge['category']>('streak')
  const [formTrigger, setFormTrigger] = useState('streak_days')
  const [formTarget, setFormTarget] = useState(7)
  const [formXp, setFormXp] = useState(200)
  const [formTier, setFormTier] = useState<AchievementBadge['tier']>('silver')
  const [formActive, setFormActive] = useState(true)
  const [activeStep, setActiveStep] = useState(1) // 3-step wizard: 1=Identity, 2=Rules, 3=Artwork

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be under 2 MB')
      return
    }
    setIsUploading(true)
    setUploadError(null)
    try {
      const res = await uploadExerciseMedia(file, 'badges')
      if (res?.publicUrl) setFormIconUrl(res.publicUrl)
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormIcon('🏆')
    setFormIconUrl('')
    setUploadError(null)
    setFormCategory('streak')
    setFormTrigger('streak_days')
    setFormTarget(7)
    setFormXp(200)
    setFormTier('silver')
    setFormActive(true)
    setActiveStep(1)
  }

  const openCreateModal = () => {
    setEditingBadge(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (badge: AchievementBadge) => {
    setEditingBadge(badge)
    setFormTitle(badge.title)
    setFormDescription(badge.description)
    setFormIcon(badge.icon)
    setFormIconUrl(badge.icon_url || '')
    setUploadError(null)
    setFormCategory(badge.category)
    setFormTrigger(badge.metricTrigger)
    setFormTarget(badge.targetValue)
    setFormXp(badge.xpReward)
    setFormTier(badge.tier)
    setFormActive(badge.active)
    setActiveStep(1)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formTitle.trim()) { showToast('Badge title is required', false); return }
    if (!formDescription.trim()) { showToast('Description is required', false); return }

    if (editingBadge) {
      onUpdateBadges(badges.map((b) =>
        b.id === editingBadge.id
          ? { ...b, title: formTitle, description: formDescription, icon: formIcon, icon_url: formIconUrl || undefined, category: formCategory, metricTrigger: formTrigger, targetValue: Number(formTarget), xpReward: Number(formXp), tier: formTier, active: formActive }
          : b
      ))
      showToast(`Updated "${formTitle}"`)
    } else {
      onUpdateBadges([...badges, {
        id: `badge-${Date.now()}`,
        title: formTitle,
        description: formDescription,
        icon: formIcon,
        icon_url: formIconUrl || undefined,
        category: formCategory,
        metricTrigger: formTrigger,
        targetValue: Number(formTarget),
        xpReward: Number(formXp),
        tier: formTier,
        active: formActive,
        unlockedCount: 0,
      }])
      showToast(`Created "${formTitle}"`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    onUpdateBadges(badges.filter((b) => b.id !== id))
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
    fetch(`/api/admin/sync?entity=badges&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    }).catch(() => {})
    showToast(`Deleted "${title}"`)
  }

  const filteredBadges = badges.filter((b) => {
    const q = search.toLowerCase()
    return (
      (b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || b.category === selectedCategory) &&
      (selectedTier === 'all' || b.tier === selectedTier)
    )
  })

  const tierCfg = TIER_CONFIG[formTier]

  return (
    <div className="space-y-6 pb-12">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`fixed top-5 right-5 z-[60] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold backdrop-blur-xl ${
              toast.ok
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40'
                : 'bg-rose-900/90 text-rose-100 border-rose-500/40'
            }`}
          >
            {toast.ok ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="glass p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search badges..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-48" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
            <option value="all">All Tiers</option>
            {Object.entries(TIER_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>
        <button onClick={openCreateModal}
          className="glow-button text-slate-950 font-black px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-2xl">
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Badge</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const tc = TIER_CONFIG[badge.tier]
          const cc = CATEGORY_CONFIG[badge.category]
          return (
            <motion.div key={badge.id} layout
              className={`glass rounded-3xl p-5 flex flex-col gap-3 border transition-all ${!badge.active ? 'opacity-45' : ''} ${tc.border}`}>
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center text-2xl shadow-lg ${tc.glow} overflow-hidden`}>
                  {badge.icon_url
                    ? <img src={badge.icon_url} alt={badge.title} className="w-10 h-10 object-contain" />
                    : badge.icon}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tc.bg} ${tc.text} ${tc.border}`}>
                    {tc.icon} {tc.label}
                  </span>
                  <span className={`text-[10px] font-bold ${cc.color}`}>{cc.icon} {cc.label}</span>
                </div>
              </div>
              {/* Content */}
              <div>
                <h3 className="text-sm font-black text-slate-100 leading-snug">{badge.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{badge.description}</p>
              </div>
              {/* Stats bar */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-mono">{badge.metricTrigger} ≥ {badge.targetValue}</span>
                  <span className="text-amber-400 font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> +{badge.xpReward} XP
                  </span>
                </div>
              </div>
              {/* Footer */}
              <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between">
                <button onClick={() => onUpdateBadges(badges.map((b) => b.id === badge.id ? { ...b, active: !b.active } : b))}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${badge.active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}>
                  {badge.active ? '● Active' : '○ Hidden'}
                </button>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => openEditModal(badge)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(badge.id, badge.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="glass p-14 text-center">
          <Award className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-200">No badges found</p>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or create your first reward badge.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          REDESIGNED MODAL — 3-Step Wizard
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(2,6,23,0.75)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(145deg, #0f172a 0%, #0c1424 100%)', border: '1px solid rgba(148,163,184,0.12)' }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 shrink-0"
                style={{ background: 'rgba(15,23,42,0.80)' }}>
                <div className="flex items-center gap-3">
                  {/* Live badge preview */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tierCfg.gradient} flex items-center justify-center text-xl shadow-md overflow-hidden`}>
                    {formIconUrl
                      ? <img src={formIconUrl} alt="" className="w-8 h-8 object-contain" />
                      : formIcon}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-100">
                      {editingBadge ? 'Edit Badge' : 'Create New Badge'}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {formTitle || 'Set a title below'} · {tierCfg.label} tier
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step Tabs */}
              <div className="px-6 pt-4 flex items-center gap-1 shrink-0">
                {[
                  { n: 1, label: 'Identity',  icon: Star },
                  { n: 2, label: 'Rules',     icon: Target },
                  { n: 3, label: 'Artwork',   icon: Trophy },
                ].map(({ n, label, icon: Icon }) => (
                  <button key={n} onClick={() => setActiveStep(n)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      activeStep === n
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    {activeStep > n && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  </button>
                ))}
              </div>

              {/* Step Content — Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* ── STEP 1: Identity ── */}
                {activeStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

                    {/* Title */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Badge Title *</label>
                      <input type="text" required placeholder="e.g. 7-Day Spinal Disc Traction"
                        value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-slate-100 font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all" />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description *</label>
                      <textarea rows={3} placeholder="Describe the milestone and what the user accomplished..."
                        value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-all resize-none" />
                    </div>

                    {/* Tier selector — visual cards */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Tier</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(TIER_CONFIG) as [AchievementBadge['tier'], typeof TIER_CONFIG['bronze']][]).map(([key, cfg]) => (
                          <button key={key} type="button" onClick={() => setFormTier(key)}
                            className={`py-3 rounded-2xl flex flex-col items-center gap-1 border cursor-pointer transition-all ${
                              formTier === key
                                ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-lg`
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                            }`}>
                            <span className="text-xl">{cfg.icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-wide">{cfg.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Category</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.entries(CATEGORY_CONFIG) as [AchievementBadge['category'], typeof CATEGORY_CONFIG['streak']][]).map(([key, cfg]) => (
                          <button key={key} type="button" onClick={() => setFormCategory(key)}
                            className={`py-2.5 rounded-2xl flex flex-col items-center gap-1 border cursor-pointer transition-all ${
                              formCategory === key
                                ? 'bg-slate-800 border-slate-500 text-slate-100'
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}>
                            <span className="text-lg">{cfg.icon}</span>
                            <span className="text-[10px] font-bold">{cfg.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Rules ── */}
                {activeStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

                    {/* Metric Trigger */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Unlock Trigger</label>
                      <div className="space-y-2">
                        {TRIGGER_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setFormTrigger(opt.value)}
                            className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between text-left border cursor-pointer transition-all ${
                              formTrigger === opt.value
                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}>
                            <div>
                              <span className="text-xs font-black font-mono">{opt.label}</span>
                              <span className="text-[11px] text-slate-500 ml-2 font-medium">{opt.desc}</span>
                            </div>
                            {formTrigger === opt.value && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target + XP in row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                          Target Threshold
                        </label>
                        <div className="relative">
                          <input type="number" min="1" required value={formTarget}
                            onChange={(e) => setFormTarget(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-slate-100 font-black text-center focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-medium pointer-events-none">
                            {formTrigger.includes('hours') ? 'hrs' : 'times'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Unlocks when metric ≥ this value</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                          XP Reward
                        </label>
                        <div className="relative">
                          <input type="number" min="10" step="10" required value={formXp}
                            onChange={(e) => setFormXp(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-amber-400 font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-amber-600 font-bold pointer-events-none">XP</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Awarded when badge unlocks</p>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <button type="button" onClick={() => setFormActive(!formActive)}
                      className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${
                        formActive
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4" />
                        <div className="text-left">
                          <p className="text-xs font-black">{formActive ? 'Badge Active — Earnable in app' : 'Badge Hidden — Not earnable yet'}</p>
                          <p className="text-[10px] opacity-70">Toggle to show or hide from users</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${formActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${formActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 3: Artwork ── */}
                {activeStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

                    {/* Emoji Grid */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Quick Emoji</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOJI_PRESETS.map((emo) => (
                          <button key={emo} type="button" onClick={() => { setFormIcon(emo); setFormIconUrl('') }}
                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-all border ${
                              formIcon === emo && !formIconUrl
                                ? 'bg-cyan-500/20 border-cyan-500/50 scale-110'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                            }`}>
                            {emo}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input type="text" placeholder="Or type any emoji..."
                          value={formIcon} onChange={(e) => { setFormIcon(e.target.value); setFormIconUrl('') }}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400" />
                      </div>
                    </div>

                    {/* Custom Image Upload */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        Custom Badge Image (overrides emoji)
                      </label>
                      <div className={`rounded-2xl border-2 border-dashed transition-all p-5 text-center ${
                        formIconUrl ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-700 hover:border-cyan-500/40 bg-slate-950/40'
                      }`}>
                        {formIconUrl ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierCfg.gradient} flex items-center justify-center overflow-hidden shadow-lg`}>
                                <img src={formIconUrl} alt="" className="w-12 h-12 object-contain" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                                  <Check className="w-4 h-4 stroke-[3]" /> Uploaded to Supabase
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">exercise-media/badges/</p>
                                <button type="button" onClick={() => setFormIconUrl('')}
                                  className="text-[11px] text-rose-400 hover:underline cursor-pointer mt-1">
                                  Remove & use emoji instead
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer">
                            {isUploading
                              ? <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                              : <Upload className="w-8 h-8 text-slate-500" />}
                            <span className="text-sm font-bold text-slate-300">
                              {isUploading ? 'Uploading...' : 'Click to upload badge image'}
                            </span>
                            <span className="text-[11px] text-slate-500">PNG, JPG, WebP — max 2 MB</span>
                            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={isUploading}
                              onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="Or paste direct badge image URL (https://...)"
                          value={formIconUrl}
                          onChange={(e) => setFormIconUrl(e.target.value.trim())}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                        />
                      </div>
                      {uploadError && <p className="text-xs text-rose-400 mt-1.5">{uploadError}</p>}
                    </div>

                    {/* Final Preview */}
                    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Live Preview</p>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierCfg.gradient} flex items-center justify-center text-2xl shadow-lg overflow-hidden`}>
                          {formIconUrl
                            ? <img src={formIconUrl} alt="" className="w-12 h-12 object-contain" />
                            : formIcon}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-100">{formTitle || 'Badge Title'}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{formDescription || 'Description...'}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tierCfg.bg} ${tierCfg.text} ${tierCfg.border} border`}>
                              {tierCfg.icon} {tierCfg.label}
                            </span>
                            <span className="text-[10px] font-bold text-amber-400">+{formXp} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer Navigation */}
              <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <button key={n} type="button" onClick={() => setActiveStep(n)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${activeStep === n ? 'bg-cyan-400 w-5' : activeStep > n ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2.5">
                  {activeStep > 1 && (
                    <button type="button" onClick={() => setActiveStep(activeStep - 1)}
                      className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 text-xs font-bold cursor-pointer">
                      Back
                    </button>
                  )}
                  {activeStep < 3 ? (
                    <button type="button" onClick={() => {
                      if (activeStep === 1 && !formTitle.trim()) { showToast('Enter a badge title first', false); return }
                      setActiveStep(activeStep + 1)
                    }}
                      className="px-5 py-2 glow-button text-slate-950 font-black text-xs cursor-pointer rounded-xl shadow-md flex items-center gap-2">
                      Next <Zap className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSave}
                      className="px-6 py-2 glow-button text-slate-950 font-black text-xs cursor-pointer rounded-xl shadow-md flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {editingBadge ? 'Save Changes' : 'Create Badge'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
