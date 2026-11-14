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

  // Simplified metadata for non-technical clients
  const getTabMetadata = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Home (At a Glance)',
          subtitle: 'Live business stats, member growth, and daily routine numbers',
          quickActionLabel: undefined,
        }
      case 'stretches':
        return {
          title: 'Daily Exercises & Stretches',
          subtitle: 'Add, change, or remove stretching routines shown in the mobile app',
          quickActionLabel: '+ Add Exercise',
        }
      case 'nutrition':
        return {
          title: 'Food & Meals Catalog',
          subtitle: 'Manage Indian food presets, calories, protein grams, and bone vitamins',
          quickActionLabel: '+ Add Food',
        }
      case 'badges':
        return {
          title: 'Rewards & Milestone Badges',
          subtitle: 'Configure trophies, medal tiers, and XP points teenagers earn',
          quickActionLabel: '+ Add Reward',
        }
      case 'ai-prompts':
        return {
          title: 'AI Helper Quick Question Chips',
          subtitle: '1-tap question buttons and safe pre-written replies for Dr. Jack',
          quickActionLabel: '+ Add Question',
        }
      case 'users':
        return {
          title: 'App Members & Accounts',
          subtitle: 'Inspect member heights, grant VIP access, or download/delete data',
          quickActionLabel: undefined,
        }
    }
  }

  const { title, subtitle, quickActionLabel } = getTabMetadata(currentTab)

  const handleQuickAction = () => {
    // If on overview, switch to stretches or relevant creation
    if (currentTab === 'overview') {
      setCurrentTab('stretches')
    }
  }

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      {/* Subtle Ambient Blue Lighting Glow */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(219,234,254,0.4),rgba(255,255,255,0))] z-0"
      />
      <div
        className="fixed top-20 right-10 w-96 h-96 rounded-full bg-blue-100/20 blur-3xl pointer-events-none z-0"
      />
      <div
        className="fixed bottom-10 left-80 w-96 h-96 rounded-full bg-indigo-100/20 blur-3xl pointer-events-none z-0"
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
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-600">Connecting to live GoTall database...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
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
