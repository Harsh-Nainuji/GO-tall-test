'use client'

import React, { useState } from 'react'
import {
  Bot,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Send,
} from 'lucide-react'
import { AiPromptChip } from '@/lib/admin-store'

interface AiPromptsCMSProps {
  chips: AiPromptChip[]
  onUpdateChips: (chips: AiPromptChip[]) => void
}

export function AiPromptsCMS({ chips, onUpdateChips }: AiPromptsCMSProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChip, setEditingChip] = useState<AiPromptChip | null>(null)

  // Form State
  const [formLabel, setFormLabel] = useState('')
  const [formCategory, setFormCategory] = useState<AiPromptChip['category']>('Biometrics')
  const [formPrompt, setFormPrompt] = useState('')
  const [formResponse, setFormResponse] = useState('')
  const [formActive, setFormActive] = useState(true)

  // System Guardrails
  const [systemPrompt, setSystemPrompt] = useState(
    `You are the GoTall Clinical Growth Advisor. You provide honest, peer-reviewed pediatric growth and spinal biomechanics guidance.
Guardrails:
1. Never promise impossible height gains beyond epiphyseal biology.
2. Ground all genetic baseline projections in the Tanner-Whitehouse III equation.
3. Attribute diurnal height changes (1.0–2.5 cm) strictly to intervertebral disc decompression.
4. Refuse requests promoting unverified limb lengthening or dangerous pseudo-hormone supplements.`
  )
  const [guardrailSaved, setGuardrailSaved] = useState(false)

  const openCreateModal = () => {
    setEditingChip(null)
    setFormLabel('')
    setFormCategory('Biometrics')
    setFormPrompt('')
    setFormResponse('')
    setFormActive(true)
    setIsModalOpen(true)
  }

  const openEditModal = (chip: AiPromptChip) => {
    setEditingChip(chip)
    setFormLabel(chip.label)
    setFormCategory(chip.category)
    setFormPrompt(chip.prompt)
    setFormResponse(chip.presetResponse)
    setFormActive(chip.active)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formLabel.trim() || !formPrompt.trim()) return

    if (editingChip) {
      const updated = chips.map((c) =>
        c.id === editingChip.id
          ? {
              ...c,
              label: formLabel,
              category: formCategory,
              prompt: formPrompt,
              presetResponse: formResponse,
              active: formActive,
            }
          : c
      )
      onUpdateChips(updated)
    } else {
      const newChip: AiPromptChip = {
        id: `chip-${Date.now()}`,
        label: formLabel,
        category: formCategory,
        prompt: formPrompt,
        presetResponse: formResponse,
        clicksCount: 0,
        active: formActive,
        order: chips.length + 1,
      }
      onUpdateChips([...chips, newChip])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this AI prompt chip?')) {
      onUpdateChips(chips.filter((c) => c.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    onUpdateChips(
      chips.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    )
  }

  const handleSaveGuardrails = () => {
    setGuardrailSaved(true)
    setTimeout(() => setGuardrailSaved(false), 2000)
  }

  const filteredChips = chips.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompt chips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Prompt Categories</option>
            <option value="Biometrics">Biometrics</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Sleep & Hormones">Sleep & Hormones</option>
            <option value="Posture & Spine">Posture & Spine</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add 1-Tap Prompt Chip</span>
        </button>
      </div>

      {/* Main Layout: Prompt Chips List (left) + Mobile Chat Preview & Guardrails (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chips List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Configured 1-Tap Quick Suggestion Chips ({filteredChips.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Users tap these to trigger immediate advisor responses
            </span>
          </div>

          <div className="space-y-3">
            {filteredChips.map((chip) => (
              <div
                key={chip.id}
                className={`admin-card p-4 transition-all ${
                  !chip.active ? 'opacity-60 bg-slate-50/50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{chip.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          chip.category === 'Biometrics'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : chip.category === 'Nutrition'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : chip.category === 'Sleep & Hormones'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {chip.category}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 mt-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500 flex-none" />
                      <span>&ldquo;{chip.prompt}&rdquo;</span>
                    </p>

                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                      <strong className="text-slate-800">Response: </strong>
                      {chip.presetResponse}
                    </div>
                  </div>

                  {/* Actions & Toggle */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleActive(chip.id)}
                      title={chip.active ? 'Active on Mobile' : 'Inactive'}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        chip.active
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {chip.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(chip)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(chip.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {chip.clicksCount.toLocaleString()} taps
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Mobile UI Preview & Guardrails */}
        <div className="space-y-6">
          {/* Mobile Chatbox Preview Mock */}
          <div className="admin-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Mobile Chatbox Preview</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Client Input
              </span>
            </div>

            {/* Mock Chat View */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/90 p-3 rounded-2xl rounded-tl-sm border border-slate-700 text-slate-200 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                  <Bot className="w-3.5 h-3.5" /> GoTall Growth Advisor
                </div>
                Hi! Ask me anything about your epiphyseal plates, bedtime nutrition, or spinal decompression.
              </div>

              {/* Live Horizontal Scrollable Prompt Chips */}
              <div className="pt-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                  1-Tap Suggestion Chips:
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                  {chips
                    .filter((c) => c.active)
                    .slice(0, 4)
                    .map((chip) => (
                      <div
                        key={chip.id}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 rounded-full text-[10px] text-blue-200 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        {chip.label}
                      </div>
                    ))}
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="mt-2 flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700 text-slate-400 text-xs">
                <input
                  type="text"
                  readOnly
                  placeholder="Ask a direct growth question..."
                  className="bg-transparent text-xs text-white placeholder-slate-500 outline-none flex-1"
                />
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* System Prompt & Guardrails Config */}
          <div className="admin-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Clinical System Guardrails</h3>
              </div>
              {guardrailSaved && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enforced across all user conversations. Prevents fake claims and ensures scientific fidelity.
            </p>

            <textarea
              rows={7}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              onClick={handleSaveGuardrails}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Update AI Guardrails
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Prompt Chip */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden modal-content-animate">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingChip ? 'Edit Prompt Chip' : 'Add 1-Tap Prompt Chip'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chip Button Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🦴 Growth Plate Status"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Biometrics">Biometrics</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Sleep & Hormones">Sleep & Hormones</option>
                    <option value="Posture & Spine">Posture & Spine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Sent to AI when Tapped
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Are my growth plates still open based on my age and velocity?"
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preset Peer-Reviewed Clinical Response
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Verified response provided when offline or cached..."
                  value={formResponse}
                  onChange={(e) => setFormResponse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chipActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chipActive" className="font-medium text-slate-700 cursor-pointer">
                  Active (appears in mobile AI advisor prompt bar)
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
                  {editingChip ? 'Save Changes' : 'Add Prompt Chip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

