'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Bot,
  Calendar,
  Lock,
  Unlock,
  Archive,
  RefreshCw,
  Trash2,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { SubscriptionPlan } from '@/lib/admin-store'

interface PlansCMSProps {
  plans: SubscriptionPlan[]
  onUpdatePlans: (plans: SubscriptionPlan[]) => void
}

export function PlansCMS({ plans, onUpdatePlans }: PlansCMSProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [isNewPlan, setIsNewPlan] = useState(false)
  const [featureInput, setFeatureInput] = useState('')

  const filteredPlans = plans.filter((p) => {
    if (filter === 'active') return p.active
    if (filter === 'archived') return !p.active
    return true
  })

  const handleToggleArchive = (planId: string) => {
    const updated = plans.map((p) =>
      p.id === planId ? { ...p, active: !p.active, updatedAt: new Date().toISOString() } : p
    )
    onUpdatePlans(updated)
  }

  const handleOpenAdd = () => {
    const newId = `plan_custom_${Date.now()}`
    const newPlan: SubscriptionPlan = {
      id: newId,
      name: 'New Custom Plan',
      tagline: 'Custom stature optimization & AI coaching package',
      priceUsd: 14.99,
      priceInr: 1299,
      interval: 'monthly',
      revenuecatProductId: 'monthly',
      badgeLabel: 'SPECIAL',
      badgeColor: '#0284C7',
      sortOrder: plans.length + 1,
      active: true,
      aiChatDailyLimit: 25,
      maxProgramWeeks: 6,
      canAccessAdvancedStretches: true,
      canAccessAiBiomechanicalCalibration: true,
      canAccessSomatotropinSleepSync: true,
      canAccessClinicalNutrition: true,
      canAccessPrioritySupport: false,
      marketingFeatures: [
        'Full 6-week progressive spinal protocol',
        '25 daily AI Clinical Advisor queries',
        'Nocturnal Somatotropin (hGH) peak sync',
      ],
    }
    setEditingPlan(newPlan)
    setIsNewPlan(true)
    setFeatureInput('')
  }

  const handleSaveModal = () => {
    if (!editingPlan) return
    let updated: SubscriptionPlan[]
    if (isNewPlan) {
      updated = [...plans, editingPlan]
    } else {
      updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    }
    onUpdatePlans(updated)
    setEditingPlan(null)
    setIsNewPlan(false)
  }

  const handleAddFeatureItem = () => {
    if (!featureInput.trim() || !editingPlan) return
    setEditingPlan({
      ...editingPlan,
      marketingFeatures: [...editingPlan.marketingFeatures, featureInput.trim()],
    })
    setFeatureInput('')
  }

  const handleRemoveFeatureItem = (idx: number) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      marketingFeatures: editingPlan.marketingFeatures.filter((_, i) => i !== idx),
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All Plans ({plans.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'active'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Active ({plans.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'archived'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Archived ({plans.filter((p) => !p.active).length})
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus size={15} />
          Create New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => (
          <motion.div
            key={plan.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative flex flex-col bg-slate-900/70 border rounded-2xl p-5 backdrop-blur-xl transition-all ${
              plan.active
                ? 'border-slate-800 hover:border-slate-700 shadow-xl shadow-slate-950/40'
                : 'border-amber-900/40 opacity-75 bg-slate-950/80'
            }`}
          >
            {/* Header Tags & Badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  plan.active
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {plan.active ? <Check size={11} /> : <Archive size={11} />}
                {plan.active ? 'Active' : 'Archived'}
              </span>

              {plan.badgeLabel && (
                <span
                  style={{
                    backgroundColor: `${plan.badgeColor || '#0284C7'}22`,
                    borderColor: `${plan.badgeColor || '#0284C7'}55`,
                    color: plan.badgeColor || '#38BDF8',
                  }}
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border"
                >
                  {plan.badgeLabel}
                </span>
              )}
            </div>

            {/* Plan Title & Tagline */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{plan.tagline}</p>
            </div>

            {/* Pricing Section */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  ${plan.priceUsd.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">
                  / {plan.interval}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 pt-1.5 border-t border-slate-800/60">
                <span>₹{plan.priceInr.toLocaleString('en-IN')} INR</span>
                <span className="font-mono text-[10px] text-slate-400">
                  RC: {plan.revenuecatProductId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Quota & Feature Matrix */}
            <div className="space-y-2 mb-4 text-xs flex-1">
              {/* Daily AI Chat Quota */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Bot size={14} className="text-blue-400" />
                  AI Chat Daily Limit
                </span>
                <span className="font-bold text-white bg-blue-600/30 px-2 py-0.5 rounded text-[11px]">
                  {plan.aiChatDailyLimit === -1 ? 'Unlimited' : `${plan.aiChatDailyLimit} chats/day`}
                </span>
              </div>

              {/* Program Duration */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Calendar size={14} className="text-indigo-400" />
                  Program Length
                </span>
                <span className="font-bold text-white bg-indigo-600/30 px-2 py-0.5 rounded text-[11px]">
                  {plan.maxProgramWeeks} Weeks
                </span>
              </div>

              {/* Feature Entitlements Badges */}
              <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Advanced Stretches</span>
                  {plan.canAccessAdvancedStretches ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5"><Check size={12} /> Yes</span>
                  ) : (
                    <span className="text-slate-400 font-bold inline-flex items-center gap-0.5"><Lock size={11} /> Locked</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">AI Posture Calibration</span>
                  {plan.canAccessAiBiomechanicalCalibration ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5"><Check size={12} /> Yes</span>
                  ) : (
                    <span className="text-slate-400 font-bold inline-flex items-center gap-0.5"><Lock size={11} /> Locked</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Somatotropin (hGH) Sync</span>
                  {plan.canAccessSomatotropinSleepSync ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5"><Check size={12} /> Yes</span>
                  ) : (
                    <span className="text-slate-400 font-bold inline-flex items-center gap-0.5"><Lock size={11} /> Locked</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Clinical Nutrition Matrix</span>
                  {plan.canAccessClinicalNutrition ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5"><Check size={12} /> Yes</span>
                  ) : (
                    <span className="text-slate-400 font-bold inline-flex items-center gap-0.5"><Lock size={11} /> Locked</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setEditingPlan(plan)
                  setIsNewPlan(false)
                  setFeatureInput('')
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
              >
                <Edit2 size={13} />
                Edit Plan
              </button>

              <button
                onClick={() => handleToggleArchive(plan.id)}
                title={plan.active ? 'Archive this plan' : 'Unarchive plan'}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  plan.active
                    ? 'border-slate-800 hover:border-amber-700/60 text-slate-400 hover:text-amber-400'
                    : 'border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/30'
                }`}
              >
                {plan.active ? <Archive size={14} /> : <RefreshCw size={14} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isNewPlan ? 'Create Subscription Plan' : `Edit: ${editingPlan.name}`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure pricing, RevenueCat product ID, and daily user feature entitlements.
                  </p>
                </div>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Identifier (ID)</label>
                  <input
                    type="text"
                    disabled={!isNewPlan}
                    value={editingPlan.id}
                    onChange={(e) => setEditingPlan({ ...editingPlan, id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Plan Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingPlan.tagline}
                    onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Price USD */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceUsd}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Price INR */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={editingPlan.priceInr}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceInr: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Billing Interval */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Interval</label>
                  <select
                    value={editingPlan.interval}
                    onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="free">Free Forever ($0)</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime VIP (One-time)</option>
                  </select>
                </div>

                {/* RevenueCat Product ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    RevenueCat Product ID
                  </label>
                  <input
                    type="text"
                    placeholder="monthly / yearly / lifetime"
                    value={editingPlan.revenuecatProductId || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, revenuecatProductId: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Badge Label */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="BEST VALUE / POPULAR"
                    value={editingPlan.badgeLabel || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badgeLabel: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Badge Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Color (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingPlan.badgeColor || '#0284C7'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, badgeColor: e.target.value })}
                      className="w-9 h-8 bg-transparent cursor-pointer rounded border border-slate-800"
                    />
                    <input
                      type="text"
                      value={editingPlan.badgeColor || '#0284C7'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, badgeColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quotas & Entitlement Limits (Crucial for Plan-based user service delivery) */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} /> Plan Entitlements & Daily Quotas
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Daily AI Chat Limit */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Daily AI Chat Quota (queries / 24h)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="-1 for unlimited"
                      value={editingPlan.aiChatDailyLimit}
                      onChange={(e) => setEditingPlan({ ...editingPlan, aiChatDailyLimit: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      e.g. 5 for Free, 20 for Monthly, 50 for Annual, -1 for Unlimited.
                    </p>
                  </div>

                  {/* Max Program Weeks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Max Program Weeks Accessible
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="12"
                      value={editingPlan.maxProgramWeeks}
                      onChange={(e) => setEditingPlan({ ...editingPlan, maxProgramWeeks: parseInt(e.target.value, 10) || 6 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      e.g. 2 weeks for Free teaser, 6 weeks for Full Protocol.
                    </p>
                  </div>
                </div>

                {/* Feature Gating Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.canAccessAdvancedStretches}
                      onChange={(e) => setEditingPlan({ ...editingPlan, canAccessAdvancedStretches: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    Unlock Advanced Stretches
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.canAccessAiBiomechanicalCalibration}
                      onChange={(e) => setEditingPlan({ ...editingPlan, canAccessAiBiomechanicalCalibration: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    Unlock AI Posture Calibration
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.canAccessSomatotropinSleepSync}
                      onChange={(e) => setEditingPlan({ ...editingPlan, canAccessSomatotropinSleepSync: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    Unlock Somatotropin (hGH) Peak Sync
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.canAccessClinicalNutrition}
                      onChange={(e) => setEditingPlan({ ...editingPlan, canAccessClinicalNutrition: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    Unlock Clinical Nutrition Matrix
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.canAccessPrioritySupport}
                      onChange={(e) => setEditingPlan({ ...editingPlan, canAccessPrioritySupport: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    VIP Gold Crown / Priority Support
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.active}
                      onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span className="font-semibold text-emerald-400">Plan is Active & Visible</span>
                  </label>
                </div>
              </div>

              {/* Marketing Bullet Points */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Marketing Features (Paywall bullets)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {editingPlan.marketingFeatures.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="flex-1 line-clamp-1">• {item}</span>
                      <button
                        onClick={() => handleRemoveFeatureItem(idx)}
                        className="text-slate-400 hover:text-red-400 p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a new feature point..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeatureItem()}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddFeatureItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModal}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
                >
                  Save Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
