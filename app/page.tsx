'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar'
import { AdminTopNav } from '@/components/admin/AdminTopNav'
import { OverviewDashboard } from '@/components/admin/OverviewDashboard'
import { BadgesCMS } from '@/components/admin/BadgesCMS'
import { StretchesCMS } from '@/components/admin/StretchesCMS'
import { NutritionCMS } from '@/components/admin/NutritionCMS'
import { PlansCMS } from '@/components/admin/PlansCMS'
import { RevenueCMS } from '@/components/admin/RevenueCMS'
import { UsersCRM } from '@/components/admin/UsersCRM'
import { DatabaseStorageInspector } from '@/components/admin/DatabaseStorageInspector'
import { AdminSpotlightTour } from '@/components/admin/AdminSpotlightTour'
import { AdminAuthGate } from '@/components/admin/AdminAuthGate'
import { useAdminData } from '@/lib/admin-store'

export default function AdminPortalPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview')
  const [globalSearch, setGlobalSearch] = useState('')
  const [isTourOpen, setIsTourOpen] = useState(false)

  const {
    isLoaded,
    badges,
    setBadges,
    stretches,
    setStretches,
    categories,
    setCategories,
    categoryQuestions,
    setCategoryQuestions,
    foods,
    setFoods,
    users,
    setUsers,
    plans,
    setPlans,
    payments,
    setPayments,
    aiChips,
    resetToSeeds,
    clearDummyData,
  } = useAdminData()

  // Clean, professional metadata for all console sections
  const getTabMetadata = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Console Overview',
          subtitle: 'Executive metrics, active subscribers, and real-time system status',
          quickActionLabel: undefined,
        }
      case 'stretches':
        return {
          title: 'Workouts & Spinal Stretches',
          subtitle: 'Biomechanical cues, traction duration, and exercise demonstration media',
          quickActionLabel: 'Add Stretch',
        }
      case 'nutrition':
        return {
          title: 'Clinical Nutrition Matrix',
          subtitle: 'Bone mineralization, growth micronutrients, and bedtime casein foods',
          quickActionLabel: 'Add Food',
        }
      case 'badges':
        return {
          title: 'Achievements & Milestones',
          subtitle: 'Habit streaks, gamification levels, and milestone XP rewards',
          quickActionLabel: 'Add Badge',
        }
      case 'plans':
        return {
          title: 'Subscription Plans & Entitlements',
          subtitle: 'Dynamic paywall pricing, daily AI chat quotas, and program week access',
          quickActionLabel: 'Add Plan',
        }
      case 'revenue':
        return {
          title: 'Revenue & Billing Ledger',
          subtitle: 'Gross revenue, estimated MRR, paying subscribers, and real-time transaction ledger',
          quickActionLabel: undefined,
        }
      case 'users':
        return {
          title: 'Subscribers & Profiles CRM',
          subtitle: 'Adult stature predictions, Tanner stage progress, and user engagement',
          quickActionLabel: undefined,
        }
      case 'storage':
        return {
          title: 'Database & Media Storage',
          subtitle: 'PostgreSQL table health, exercise-media storage bucket, and quotas',
          quickActionLabel: undefined,
        }
    }
  }

  const { title, subtitle, quickActionLabel } = getTabMetadata(currentTab)

  const handleQuickAction = () => {
    if (currentTab === 'overview') {
      setCurrentTab('stretches')
    }
  }

  const handleRefreshSync = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
    fetch('/api/admin/sync', {
      headers: { 'x-admin-token': token },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        if (data.stretches) setStretches(data.stretches)
        if (data.plans) setPlans(data.plans)
        if (data.payments) setPayments(data.payments)
        if (data.users) setUsers(data.users)
      })
      .catch(() => {})
  }

  return (
    <AdminAuthGate>
      <div className="h-screen bg-[#020617] text-slate-100 flex relative overflow-hidden">
        {/* Soft Ambient Cyan & Violet Glows */}
        <div
          className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(2,6,23,0))] z-0"
        />
        <div
          className="fixed top-20 right-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none z-0"
        />
        <div
          className="fixed bottom-10 left-80 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none z-0"
        />

        {/* Fixed Persistent Left Sidebar */}
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          badgesCount={badges.length}
          stretchesCount={stretches.length}
          foodsCount={foods.length}
          usersCount={users.length}
          aiChipsCount={aiChips.length}
          plansCount={plans.length}
          paymentsCount={payments.length}
          onResetSeeds={resetToSeeds}
          onQuickAdd={handleQuickAction}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10 overflow-hidden">
          <AdminTopNav
            title={title}
            subtitle={subtitle}
            searchTerm={globalSearch}
            onSearchChange={setGlobalSearch}
            onQuickAction={quickActionLabel ? handleQuickAction : undefined}
            quickActionLabel={quickActionLabel}
            onOpenTour={() => setIsTourOpen(true)}
          />

          <main className="flex-1 p-6 overflow-y-auto smooth-scroll-container">
            {!isLoaded ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-slate-300">
                  Connecting to live database...
                </span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="scroll-anchor-new"
                >
                  {currentTab === 'overview' && (
                    <OverviewDashboard
                      badges={badges}
                      stretches={stretches}
                      foods={foods}
                      users={users}
                      onNavigateTab={setCurrentTab}
                      onClearDummyData={clearDummyData}
                      onResetSeeds={resetToSeeds}
                    />
                  )}

                  {currentTab === 'badges' && (
                    <BadgesCMS badges={badges} onUpdateBadges={setBadges} />
                  )}

                  {currentTab === 'stretches' && (
                    <StretchesCMS
                      stretches={stretches}
                      onUpdateStretches={setStretches}
                      categories={categories}
                      onUpdateCategories={setCategories}
                      categoryQuestions={categoryQuestions}
                      onUpdateCategoryQuestions={setCategoryQuestions}
                    />
                  )}

                  {currentTab === 'nutrition' && (
                    <NutritionCMS foods={foods} onUpdateFoods={setFoods} />
                  )}

                  {currentTab === 'plans' && (
                    <PlansCMS plans={plans} onUpdatePlans={setPlans} />
                  )}

                  {currentTab === 'revenue' && (
                    <RevenueCMS
                      payments={payments}
                      plans={plans}
                      users={users}
                      onRefresh={handleRefreshSync}
                    />
                  )}

                  {currentTab === 'users' && (
                    <UsersCRM users={users} onUpdateUsers={setUsers} />
                  )}

                  {currentTab === 'storage' && (
                    <DatabaseStorageInspector />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>

        {/* Interactive Admin Guided Tutorial */}
        <AdminSpotlightTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
        />
      </div>
    </AdminAuthGate>
  )
}
