'use client'

import React, { useState } from 'react'
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar'
import { AdminTopNav } from '@/components/admin/AdminTopNav'
import { StretchesCMS } from '@/components/admin/StretchesCMS'
import { AdminSpotlightTour } from '@/components/admin/AdminSpotlightTour'
import { AdminAuthGate } from '@/components/admin/AdminAuthGate'
import { useAdminData } from '@/lib/admin-store'

export default function AdminStretchesPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('stretches')
  const [globalSearch, setGlobalSearch] = useState('')
  const [isTourOpen, setIsTourOpen] = useState(false)

  const {
    isLoaded,
    badges,
    stretches,
    setStretches,
    categories,
    setCategories,
    categoryQuestions,
    setCategoryQuestions,
    foods,
    users,
    aiChips,
    resetToSeeds,
  } = useAdminData()

  return (
      <AdminAuthGate>
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
          {/* Sidebar Navigation */}
          <AdminSidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab !== 'stretches') {
                window.location.href = `/?tab=${tab}`
              } else {
                setCurrentTab('stretches')
              }
            }}
            badgesCount={badges.length}
            stretchesCount={stretches.length}
            foodsCount={foods.length}
            usersCount={users.length}
            aiChipsCount={aiChips.length}
            onResetSeeds={resetToSeeds}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Navbar */}
            <AdminTopNav
              title="Daily Exercises & Stretches (CMS)"
              subtitle="Add, edit, and upload media (GIFs, images, MP4 videos) for height and spinal decompression exercises"
              searchTerm={globalSearch}
              onSearchChange={setGlobalSearch}
              quickActionLabel="+ Add Exercise"
              onQuickAction={() => { }}
              onOpenTour={() => setIsTourOpen(true)}
            />

            {/* Content Body */}
            <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
              {!isLoaded ? (
                <div className="flex items-center justify-center h-64 text-slate-400 font-medium text-sm">
                  Loading exercise database...
                </div>
              ) : (
                <StretchesCMS
                  stretches={stretches}
                  onUpdateStretches={setStretches}
                  categories={categories}
                  onUpdateCategories={setCategories}
                  categoryQuestions={categoryQuestions}
                  onUpdateCategoryQuestions={setCategoryQuestions}
                />
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
