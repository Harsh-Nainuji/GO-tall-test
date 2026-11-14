'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar'
import { AdminTopNav } from '@/components/admin/AdminTopNav'
import { OverviewDashboard } from '@/components/admin/OverviewDashboard'
import { BadgesCMS } from '@/components/admin/BadgesCMS'
import { StretchesCMS } from '@/components/admin/StretchesCMS'
import { NutritionCMS } from '@/components/admin/NutritionCMS'
import { UsersCRM } from '@/components/admin/UsersCRM'
import { AiPromptsCMS } from '@/components/admin/AiPromptsCMS'
import { AdminSpotlightTour } from '@/components/admin/AdminSpotlightTour'
import { AdminAuthGate } from '@/components/admin/AdminAuthGate'
import { useAdminData } from '@/lib/admin-store'
import { ADMIN_COPY } from '@/lib/admin-copy'

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
    aiChips,
    setAiChips,
    resetToSeeds,
    clearDummyData,
  } = useAdminData()

  // Simplified bilingual metadata for non-technical clients
  const getTabMetadata = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: `${ADMIN_COPY.pages.overview.title.en} / ${ADMIN_COPY.pages.overview.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.overview.subtitle.en} • ${ADMIN_COPY.pages.overview.subtitle.gu}`,
          quickActionLabel: undefined,
        }
      case 'stretches':
        return {
          title: `${ADMIN_COPY.pages.stretches.title.en} / ${ADMIN_COPY.pages.stretches.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.stretches.subtitle.en} • ${ADMIN_COPY.pages.stretches.subtitle.gu}`,
          quickActionLabel: ADMIN_COPY.pages.stretches.addBtn.en,
        }
      case 'nutrition':
        return {
          title: `${ADMIN_COPY.pages.nutrition.title.en} / ${ADMIN_COPY.pages.nutrition.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.nutrition.subtitle.en} • ${ADMIN_COPY.pages.nutrition.subtitle.gu}`,
          quickActionLabel: ADMIN_COPY.pages.nutrition.addBtn.en,
        }
      case 'badges':
        return {
          title: `${ADMIN_COPY.pages.badges.title.en} / ${ADMIN_COPY.pages.badges.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.badges.subtitle.en} • ${ADMIN_COPY.pages.badges.subtitle.gu}`,
          quickActionLabel: ADMIN_COPY.pages.badges.addBtn.en,
        }
      case 'ai-prompts':
        return {
          title: `${ADMIN_COPY.pages.aiPrompts.title.en} / ${ADMIN_COPY.pages.aiPrompts.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.aiPrompts.subtitle.en} • ${ADMIN_COPY.pages.aiPrompts.subtitle.gu}`,
          quickActionLabel: ADMIN_COPY.pages.aiPrompts.addBtn.en,
        }
      case 'users':
        return {
          title: `${ADMIN_COPY.pages.users.title.en} / ${ADMIN_COPY.pages.users.title.gu}`,
          subtitle: `${ADMIN_COPY.pages.users.subtitle.en} • ${ADMIN_COPY.pages.users.subtitle.gu}`,
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

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-[#020617] text-slate-100 flex relative overflow-x-hidden">
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
          onResetSeeds={resetToSeeds}
          onQuickAdd={handleQuickAction}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AdminTopNav
            title={title}
            subtitle={subtitle}
            searchTerm={globalSearch}
            onSearchChange={setGlobalSearch}
            onQuickAction={quickActionLabel ? handleQuickAction : undefined}
            quickActionLabel={quickActionLabel}
            onOpenTour={() => setIsTourOpen(true)}
          />

          <main className="flex-1 p-8 overflow-y-auto">
            {!isLoaded ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-slate-300">
                  Connecting to live GoTall database... / કનેક્ટ થઈ રહ્યું છે...
                </span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
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

                  {currentTab === 'users' && (
                    <UsersCRM users={users} onUpdateUsers={setUsers} />
                  )}

                  {currentTab === 'ai-prompts' && (
                    <AiPromptsCMS chips={aiChips} onUpdateChips={setAiChips} />
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
