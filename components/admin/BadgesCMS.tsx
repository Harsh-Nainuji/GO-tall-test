'use client'

import React, { useState } from 'react'
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  Activity,
  Utensils,
  Moon,
  Dna,
} from 'lucide-react'
import { AchievementBadge } from '@/lib/admin-store'

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
  const [formCategory, setFormCategory] = useState<AchievementBadge['category']>('streak')
  const [formTrigger, setFormTrigger] = useState('streak_days')
  const [formTarget, setFormTarget] = useState(7)
  const [formXp, setFormXp] = useState(200)
  const [formTier, setFormTier] = useState<AchievementBadge['tier']>('silver')
  const [formActive, setFormActive] = useState(true)

  const openCreateModal = () => {
    setEditingBadge(null)
    setFormTitle('')
    setFormDescription('')
    setFormIcon('🏆')
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
      // Update existing
      const updated = badges.map((b) =>
        b.id === editingBadge.id
          ? {
              ...b,
              title: formTitle,
              description: formDescription,
              icon: formIcon,
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
      // Create new
      const newBadge: AchievementBadge = {
        id: `badge-${Date.now()}`,
        title: formTitle,
        description: formDescription,
        icon: formIcon,
        category: formCategory,
        metricTrigger: formTrigger,
        targetValue: Number(formTarget),
        xpReward: Number(formXp),
        tier: formTier,
        active: formActive,
        unlockedCount: 0,
      }
      onUpdateBadges([newBadge, ...badges])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achievement badge?')) {
      onUpdateBadges(badges.filter((b) => b.id !== id))
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
        return 'bg-amber-100/70 text-amber-800 border-amber-300'
      case 'silver':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 shadow-2xs'
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search badges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Badge</span>
        </button>
      </div>

      {/* Badges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`admin-card p-5 flex flex-col justify-between transition-all ${
              !badge.active ? 'opacity-60 bg-slate-50/50' : 'bg-white'
            }`}
          >
            <div>
              {/* Badge Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                  {badge.icon}
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      badge.active
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}
                  >
                    {badge.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3.5">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{badge.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Metric Trigger & XP */}
              <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Trigger Rule:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {badge.metricTrigger} &gt;= {badge.targetValue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">XP Reward:</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> +{badge.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer: Unlocked Stats & Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Unlocked by <strong className="text-slate-700">{badge.unlockedCount.toLocaleString()}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(badge)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Badge"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(badge.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="admin-card p-12 text-center text-slate-400">
          <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No achievement badges found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Modal: Create or Edit Badge */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden modal-content-animate">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingBadge ? 'Edit Achievement Badge' : 'Create New Achievement Badge'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Badge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day Spinal Disc Traction"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the milestone requirement and anatomical benefit..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex gap-1.5 justify-center mt-1.5">
                    {['🏆', '🔥', '🧘', '🥩', '🌙', '⚡', '🧬', '💧'].map((emo) => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setFormIcon(emo)}
                        className="text-base p-1 hover:bg-slate-100 rounded"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  <label className="block font-semibold text-slate-700 mb-1">Metric Trigger Key</label>
                  <select
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  <label className="block font-semibold text-slate-700 mb-1">Target Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formTarget}
                    onChange={(e) => setFormTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">XP Points</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={formXp}
                    onChange={(e) => setFormXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeCheck" className="font-medium text-slate-700 cursor-pointer">
                  Active (available for mobile app users to unlock)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-600/30"
                >
                  {editingBadge ? 'Save Changes' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

