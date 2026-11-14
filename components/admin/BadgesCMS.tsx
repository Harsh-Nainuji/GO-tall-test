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
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { AchievementBadge } from '@/lib/admin-store'
import { ADMIN_COPY } from '@/lib/admin-copy'
import { uploadExerciseMedia } from '@/lib/supabase'

interface BadgesCMSProps {
  badges: AchievementBadge[]
  onUpdateBadges: (badges: AchievementBadge[]) => void
}

export function BadgesCMS({ badges, onUpdateBadges }: BadgesCMSProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<AchievementBadge | null>(null)

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be under 2 MB / ચિત્રનું કદ 2 MB થી ઓછું હોવું જોઈએ')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const res = await uploadExerciseMedia(file, 'badges')
      if (res?.publicUrl) {
        setFormIconUrl(res.publicUrl)
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed / અપલોડ નિષ્ફળ ગયું')
    } finally {
      setIsUploading(false)
    }
  }

  const openCreateModal = () => {
    setEditingBadge(null)
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
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (editingBadge) {
      const updated = badges.map((b) =>
        b.id === editingBadge.id
          ? {
              ...b,
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
            }
          : b
      )
      onUpdateBadges(updated)
    } else {
      const newBadge: AchievementBadge = {
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
      }
      onUpdateBadges([...badges, newBadge])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this reward badge from the gamification catalog? / આ બેજ દૂર કરવો છે?')) {
      onUpdateBadges(badges.filter((b) => b.id !== id))
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
      fetch(`/api/admin/sync?entity=badges&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }).catch((err) => console.warn('Failed deleting badge from Supabase:', err))
    }
  }

  const handleToggleActive = (id: string) => {
    onUpdateBadges(
      badges.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    )
  }

  const filteredBadges = badges.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory
    const matchesTier = selectedTier === 'all' || b.tier === selectedTier
    return matchesSearch && matchesCategory && matchesTier
  })

  const getTierStyles = (tier: AchievementBadge['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-900/40 text-amber-300 border-amber-700/60'
      case 'silver':
        return 'bg-slate-800 text-slate-200 border-slate-600'
      case 'gold':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40'
      case 'platinum':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="glass p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search badges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-48"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Categories</option>
            <option value="streak">Streak</option>
            <option value="stretches">Spine Stretches</option>
            <option value="nutrition">Nutrition</option>
            <option value="sleep">Sleep</option>
            <option value="biometrics">Biometrics</option>
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        {/* Create Badge Button */}
        <button
          onClick={openCreateModal}
          className="glow-button text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <div className="flex flex-col text-left leading-tight">
            <span>{ADMIN_COPY.pages.badges.addBtn.en}</span>
            <span className="text-[10px] font-normal opacity-80">{ADMIN_COPY.pages.badges.addBtn.gu}</span>
          </div>
        </button>
      </div>

      {/* Badges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`glass p-5 flex flex-col justify-between transition-all ${
              !badge.active ? 'opacity-50 bg-slate-950/40' : ''
            }`}
          >
            <div>
              {/* Badge Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                  {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.title} className="w-8 h-8 object-contain" />
                  ) : (
                    badge.icon
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTierStyles(
                      badge.tier
                    )}`}
                  >
                    {badge.tier}
                  </span>
                  <button
                    onClick={() => handleToggleActive(badge.id)}
                    title={badge.active ? 'Click to deactivate' : 'Click to activate'}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors cursor-pointer ${
                      badge.active
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {badge.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3.5">
                <h3 className="text-sm font-bold text-slate-100 leading-snug">{badge.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Metric Trigger & XP */}
              <div className="mt-4 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Trigger Rule:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {badge.metricTrigger} &gt;= {badge.targetValue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>XP Reward:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> +{badge.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Unlocked Stats & Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Unlocked by <strong className="text-slate-300">{badge.unlockedCount.toLocaleString()}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(badge)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit Badge"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Badge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="glass p-12 text-center text-slate-400">
          <Award className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-bold text-slate-200">No achievement badges found / કોઈ બેજ નથી</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or add a new reward badge.</p>
        </div>
      )}

      {/* Modal: Create or Edit Badge */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-lg overflow-hidden modal-content-animate text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">
                  {editingBadge ? 'Edit Badge / બેજ બદલો' : 'Add Reward / ઇનામ ઉમેરો'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Badge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day Spinal Disc Traction"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Description / વર્ણન</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the milestone requirement and anatomical benefit..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                />
              </div>

              {/* Custom Badge Artwork Dropzone */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Custom Badge Artwork (PNG, JPG, WebP &lt; 2MB) / કસ્ટમ બેજ ચિત્ર
                </label>
                <div className="p-3.5 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl bg-slate-950/40 text-center transition-colors">
                  {formIconUrl ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={formIconUrl}
                          alt="Badge Artwork"
                          className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-slate-700 p-1"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">Custom Artwork Uploaded</p>
                          <p className="text-[11px] text-emerald-400">Stored in exercise-media/badges/</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIconUrl('')}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-1">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      )}
                      <span className="text-xs font-bold text-slate-300">
                        {isUploading ? 'Uploading to Supabase Storage...' : 'Click or drop badge image (max 2MB)'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP supported</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-rose-400 mt-1">{uploadError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                  />
                  <div className="flex gap-1.5 justify-center mt-1.5">
                    {['🏆', '🔥', '🧘', '🥩', '🌙', '⚡', '🧬', '💧'].map((emo) => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setFormIcon(emo)}
                        className="text-base p-1 hover:bg-slate-800 rounded cursor-pointer"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="streak">Streak</option>
                    <option value="stretches">Spine Stretches</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep</option>
                    <option value="biometrics">Biometrics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Metric Trigger Key</label>
                  <select
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="streak_days">streak_days</option>
                    <option value="stretches_completed">stretches_completed</option>
                    <option value="protein_target_hit">protein_target_hit</option>
                    <option value="deep_sleep_hours">deep_sleep_hours</option>
                    <option value="water_quota_met">water_quota_met</option>
                    <option value="quiz_completed">quiz_completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Target Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formTarget}
                    onChange={(e) => setFormTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">XP Reward</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={formXp}
                    onChange={(e) => setFormXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="badgeActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <label htmlFor="badgeActive" className="font-bold text-slate-300 cursor-pointer">
                  Active (earnable in mobile app)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel / રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glow-button text-slate-950 font-bold cursor-pointer shadow-md transition-all"
                >
                  {editingBadge ? 'Save / સાચવો' : '+ Add Reward / + ઉમેરો'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
