'use client'

import React, { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Flame,
  Award,
  Activity,
  Utensils,
  Moon,
  Sparkles,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { UserBiometricProfile } from '@/lib/admin-store'

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
            />
          </div>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Biological Sex</option>
            <option value="Male">Male (46, XY)</option>
            <option value="Female">Female (46, XX)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Subscriptions</option>
            <option value="Pro">Pro Members (Paid)</option>
            <option value="Free">Free Diagnostic</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium self-end md:self-center">
          Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
          {users.length} Biometric Profiles
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Current Stature</th>
                <th className="py-3 px-4">Projected Stature</th>
                <th className="py-3 px-4">Growth Plate Status</th>
                <th className="py-3 px-4">Retention / Streak</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-right">Biometric Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-600" />
                    <p className="font-bold text-slate-700 text-sm">No registered app members yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      All dummy data has been removed. When users sign up or complete their diagnostic evaluation on the mobile app, their real biometrics and growth plans will appear here live.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {user.age} yrs • {user.gender}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {user.currentHeight} cm
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-600">{user.predictedHeight} cm</span>{' '}
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      (+{user.potentialGain} cm)
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        user.growthPlateStatus.includes('Accelerated')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : user.growthPlateStatus.includes('Decelerating')
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : user.growthPlateStatus.includes('Terminal')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {user.growthPlateStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{user.streakDays}d streak</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user.stretchesCompleted} stretches • {user.unlockedBadgesCount} badges
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.subscriptionTier.includes('Pro')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
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
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Biometric Detail Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden modal-content-animate max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedUser.name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedUser.email} • Joined {selectedUser.joinDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Primary Biometric Trajectory */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Current Height
                  </span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">
                    {selectedUser.currentHeight} <span className="text-sm font-normal">cm</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Baseline calibrated</span>
                </div>

                <div>
                  <span className="text-[11px] text-blue-600 uppercase tracking-wider font-semibold block">
                    Projected Adult Height
                  </span>
                  <span className="text-2xl font-bold text-blue-600 mt-1 block">
                    {selectedUser.predictedHeight} <span className="text-sm font-normal">cm</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    +{selectedUser.potentialGain} cm Potential
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Epiphyseal Plate State
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-2 block">
                    {selectedUser.growthPlateStatus}
                  </span>
                  <span className="text-[10px] text-slate-400">Tanner Stage {selectedUser.tannerStage}</span>
                </div>
              </div>

              {/* Mid-Parental Genetic Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Mid-Parental Genetic Calculation (Tanner-Whitehouse)
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block">Biological Father:</span>
                      <strong className="text-slate-900 text-sm">{selectedUser.fatherHeight} cm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Biological Mother:</span>
                      <strong className="text-slate-900 text-sm">{selectedUser.motherHeight} cm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Calculated Set-Point:</span>
                      <strong className="text-blue-600 text-sm">
                        {selectedUser.midParentalTarget} cm
                      </strong>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    Equation: ({selectedUser.fatherHeight} + {selectedUser.motherHeight}{' '}
                    {selectedUser.gender === 'Male' ? '+ 13' : '- 13'}) / 2 ={' '}
                    {selectedUser.midParentalTarget} cm ± 2.5 cm
                  </div>
                </div>
              </div>

              {/* App Adherence & Retention Stats */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Behavioral Adherence & Unlocked Achievements
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-center">
                    <span className="text-amber-600 font-bold text-lg block">
                      {selectedUser.streakDays}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">Consecutive Days</span>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl text-center">
                    <span className="text-blue-600 font-bold text-lg block">
                      {selectedUser.stretchesCompleted}
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium">Stretches Done</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-center">
                    <span className="text-emerald-600 font-bold text-lg block">
                      {selectedUser.nutritionLoggedCount}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Foods Logged</span>
                  </div>

                  <div className="p-3 bg-purple-50/50 border border-purple-200/60 rounded-xl text-center">
                    <span className="text-purple-600 font-bold text-lg block">
                      {selectedUser.unlockedBadgesCount}
                    </span>
                    <span className="text-[10px] text-purple-700 font-medium">Badges Earned</span>
                  </div>
                </div>
              </div>

              {/* Subscription Management */}
              <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Subscription Tier</span>
                  <span className="text-[11px] text-slate-500">
                    Currently: <strong>{selectedUser.subscriptionTier}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Free')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedUser.subscriptionTier === 'Free'
                        ? 'bg-white border-slate-400 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Pro Monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedUser.subscriptionTier === 'Pro Monthly'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                        : 'border-purple-200 hover:bg-purple-50 text-purple-700'
                    }`}
                  >
                    Pro Monthly
                  </button>
                  <button
                    onClick={() => handleTierChange(selectedUser.id, 'Pro Annual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedUser.subscriptionTier === 'Pro Annual'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                        : 'border-purple-200 hover:bg-purple-50 text-purple-700'
                    }`}
                  >
                    Pro Annual
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400">
                Last Activity: {selectedUser.recentActivity} ({selectedUser.lastActive})
              </span>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

