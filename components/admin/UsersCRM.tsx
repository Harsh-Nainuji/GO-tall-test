'use client'

import React, { useState } from 'react'
import {
  Users,
  Search,
  Activity,
  Flame,
  ShieldCheck,
  X,
  Trash2,
  Download,
  Mail,
  Loader2,
} from 'lucide-react'
import { UserBiometricProfile } from '@/lib/admin-store'
import { ADMIN_COPY } from '@/lib/admin-copy'

interface UsersCRMProps {
  users: UserBiometricProfile[]
  onUpdateUsers: (users: UserBiometricProfile[]) => void
}

export function UsersCRM({ users, onUpdateUsers }: UsersCRMProps) {
  const [search, setSearch] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserBiometricProfile | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesGender = selectedGender === 'all' || u.gender === selectedGender
    const matchesStatus = selectedStatus === 'all' || u.growthPlateStatus.includes(selectedStatus)
    const matchesTier = selectedTier === 'all' || u.subscriptionTier.includes(selectedTier)
    return matchesSearch && matchesGender && matchesStatus && matchesTier
  })

  const handleTierChange = (userId: string, newTier: UserBiometricProfile['subscriptionTier']) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, subscriptionTier: newTier } : u))
    onUpdateUsers(updated)
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, subscriptionTier: newTier })
    }
  }

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Permanently delete member "${name}"? / શું તમે ખરેખર "${name}" ને દૂર કરવા માંગો છો?`)) {
      const updated = users.filter((u) => u.id !== userId)
      onUpdateUsers(updated)
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
      fetch(`/api/admin/sync?entity=users&id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }).catch((err) => console.warn('Failed deleting user from Supabase:', err))
    }
  }

  const handleExportUser = (user: UserBiometricProfile) => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gotall_member_${user.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailNotice, setEmailNotice] = useState<string | null>(null)

  const handleSendReportEmail = async (u: UserBiometricProfile) => {
    setIsSendingEmail(true)
    setEmailNotice(null)
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          action: 'growth-report',
          to: u.email,
          name: u.name,
          metrics: {
            streakDays: u.streakDays,
            stretchesCompleted: u.stretchesCompleted,
            avgSleep: 8.5,
            proteinHitRate: '90%',
          },
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEmailNotice(`Report sent to ${u.email}! / રિપોર્ટ મોકલી દીધો`)
      } else {
        setEmailNotice(data.error || 'Failed to send email / ઇમેઇલ મોકલવામાં ભૂલ')
      }
    } catch (err: any) {
      setEmailNotice(err.message || 'Error sending email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="glass p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-56"
            />
          </div>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Sexes / બધી જાતિ</option>
            <option value="Male">Male (46, XY)</option>
            <option value="Female">Female (46, XX)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Growth Plate States</option>
            <option value="Accelerated">Open (Accelerated)</option>
            <option value="Decelerating">Open (Decelerating)</option>
            <option value="Terminal">Terminal Fusion Window</option>
            <option value="Ossified">Fully Ossified</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Subscriptions</option>
            <option value="Pro">Pro Members (Paid)</option>
            <option value="Free">Free Diagnostic</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium self-end md:self-center">
          Showing <strong className="text-slate-100">{filteredUsers.length}</strong> of{' '}
          {users.length} Members / સભ્યો
        </div>
      </div>

      {/* Users Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Member Details</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Current Height</th>
                <th className="py-3 px-4">Target Adult Height</th>
                <th className="py-3 px-4">Growth Plates</th>
                <th className="py-3 px-4">Streak Days</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
                    <p className="font-bold text-slate-200 text-sm">No registered members yet / કોઈ સભ્ય નોંધાયેલ નથી</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      When users sign up on the mobile app, their biometrics will appear here live.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {user.age} yrs &bull; {user.gender}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {user.currentHeight} cm
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-cyan-400">{user.predictedHeight} cm</span>{' '}
                      <span className="text-[10px] text-emerald-400 font-bold">
                        (+{user.potentialGain} cm)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.growthPlateStatus.includes('Accelerated')
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : user.growthPlateStatus.includes('Decelerating')
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : user.growthPlateStatus.includes('Terminal')
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                        }`}
                      >
                        {user.growthPlateStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{user.streakDays}d</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {user.stretchesCompleted} stretches
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.subscriptionTier.includes('Pro')
                            ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {user.subscriptionTier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedUser(user)
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Inspect / જુઓ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Biometric Detail Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-2xl overflow-hidden modal-content-animate max-h-[90vh] flex flex-col text-slate-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  {selectedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">{selectedUser.name}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedUser.email} &bull; Joined {selectedUser.joinDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Primary Biometric Trajectory */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-cyan-500/10 border border-cyan-500/25 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">
                    Current Height
                  </span>
                  <span className="text-2xl font-black text-slate-100 mt-1 block">
                    {selectedUser.currentHeight} <span className="text-sm font-normal text-slate-400">cm</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Baseline calibrated</span>
                </div>

                <div>
                  <span className="text-[11px] text-cyan-300 uppercase tracking-wider font-bold block">
                    Target Adult Height
                  </span>
                  <span className="text-2xl font-black text-cyan-400 mt-1 block">
                    {selectedUser.predictedHeight} <span className="text-sm font-normal text-slate-400">cm</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    +{selectedUser.potentialGain} cm Potential
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">
                    Growth Plates
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-2 block">
                    {selectedUser.growthPlateStatus}
                  </span>
                  <span className="text-[10px] text-slate-500">Tanner Stage {selectedUser.tannerStage}</span>
                </div>
              </div>

              {/* Mid-Parental Genetic Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Mid-Parental Genetic Calculation (Tanner-Whitehouse)
                </h4>
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Father:</span>
                      <strong className="text-slate-100 text-sm">{selectedUser.fatherHeight} cm</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mother:</span>
                      <strong className="text-slate-100 text-sm">{selectedUser.motherHeight} cm</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Calculated Set-Point:</span>
                      <strong className="text-cyan-400 text-sm">
                        {selectedUser.midParentalTarget} cm
                      </strong>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                    Equation: ({selectedUser.fatherHeight} + {selectedUser.motherHeight}{' '}
                    {selectedUser.gender === 'Male' ? '+ 13' : '- 13'}) / 2 ={' '}
                    {selectedUser.midParentalTarget} cm
                  </div>
                </div>
              </div>

              {/* Behavioral Adherence Stats */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Activity &amp; Streak Stats
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-center">
                    <span className="text-amber-400 font-black text-lg block">
                      {selectedUser.streakDays}
                    </span>
                    <span className="text-[10px] text-amber-300 font-medium">Streak Days</span>
                  </div>

                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded-xl text-center">
                    <span className="text-cyan-400 font-black text-lg block">
                      {selectedUser.stretchesCompleted}
                    </span>
                    <span className="text-[10px] text-cyan-300 font-medium">Stretches Done</span>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center">
                    <span className="text-emerald-400 font-black text-lg block">
                      {selectedUser.nutritionLoggedCount}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-medium">Foods Logged</span>
                  </div>

                  <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl text-center">
                    <span className="text-violet-400 font-black text-lg block">
                      {selectedUser.unlockedBadgesCount}
                    </span>
                    <span className="text-[10px] text-violet-300 font-medium">Badges</span>
                  </div>
                </div>
              </div>

              {/* Subscription Management */}
              <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Subscription Tier</span>
                  <span className="text-[11px] text-slate-400">
                    Currently: <strong className="text-cyan-300">{selectedUser.subscriptionTier}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Free')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedUser.subscriptionTier === 'Free'
                        ? 'bg-slate-800 border-slate-600 text-slate-100 font-bold'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Pro Monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedUser.subscriptionTier === 'Pro Monthly'
                        ? 'bg-violet-600 text-white border-violet-500 font-bold'
                        : 'border-violet-500/30 hover:bg-violet-950/50 text-violet-300'
                    }`}
                  >
                    Pro Monthly
                  </button>
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Pro Annual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedUser.subscriptionTier === 'Pro Annual'
                        ? 'bg-violet-600 text-white border-violet-500 font-bold'
                        : 'border-violet-500/30 hover:bg-violet-950/50 text-violet-300'
                    }`}
                  >
                    Pro Annual
                  </button>
                </div>
              </div>
            </div>

            {/* Footer with Delete Member Action */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <button
                onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete member / સભ્ય દૂર કરો</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleSendReportEmail(selectedUser)}
                  disabled={isSendingEmail}
                  className="px-3.5 py-2 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  title="Send Growth Report Email"
                >
                  {isSendingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  <span>Send Report / ઇમેઇલ રિપોર્ટ</span>
                </button>
                <button
                  onClick={() => handleExportUser(selectedUser)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setEmailNotice(null)
                  }}
                  className="px-4 py-2 glow-button text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {emailNotice && (
              <div className="px-6 py-2.5 bg-cyan-950/60 border-t border-cyan-800/40 text-xs text-cyan-300 font-medium">
                {emailNotice}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
