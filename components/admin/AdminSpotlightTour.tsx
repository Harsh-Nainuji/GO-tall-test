'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Activity,
  UploadCloud,
  Layers,
  HelpCircle,
  Users,
  CheckCircle2,
} from 'lucide-react'

export interface AdminTourStep {
  id: string
  stepNumber: number
  badge: string
  icon: string
  title: string
  subtitle: string
  whatItDoes: string
  operatorAdvice: string
}

const ADMIN_TOUR_STEPS: AdminTourStep[] = [
  {
    id: 'stretches-cms',
    stepNumber: 1,
    badge: 'Exercise Engine',
    icon: '🏋️',
    title: 'Workouts & Exercises CMS',
    subtitle: 'Full Control of Clinical Spinal Routines',
    whatItDoes:
      'Manage all clinical decompression routines shown to users. You can edit titles, clinical benefits, step-by-step instructions, target spinal zones, and intensity levels.',
    operatorAdvice:
      'Any exercise marked "Active" immediately syncs to the mobile app and is automatically scheduled into users\' weekly routines.',
  },
  {
    id: 'media-upload',
    stepNumber: 2,
    badge: 'Strict Media Rules',
    icon: '🎥',
    title: 'Drag-and-Drop Media Upload',
    subtitle: 'Upload Media. GIFs/Images (Max 2MB). MP4 Video (Max 15MB).',
    whatItDoes:
      'Easily drag and drop MP4 demonstration videos, animated GIFs, or posture photos. The system strictly checks file sizes before upload (<15MB for MP4 video, <2MB for images/GIFs) and securely stores them in Supabase Storage.',
    operatorAdvice:
      'In the mobile app, videos play on a continuous muted loop as the 60-second exercise timer counts down.',
  },
  {
    id: 'categories-builder',
    stepNumber: 3,
    badge: 'Kid-Friendly Builder',
    icon: '🌱',
    title: 'Workout Categories & 1-Click Assignment',
    subtitle: 'Designed so an 8-Year-Old Can Do It',
    whatItDoes:
      'Create custom workout categories (e.g. Height Growth, Posture Reset, Morning Elongation). Pick a fun emoji, choose a color, and assign workouts with simple 1-click checkboxes.',
    operatorAdvice:
      'Your categories automatically turn into filter tabs on the mobile workout screen so users can focus on specific routines.',
  },
  {
    id: 'question-templates',
    stepNumber: 4,
    badge: 'Dynamic Quiz System',
    icon: '❓',
    title: 'Category Diagnostic Questions',
    subtitle: 'Template System for Onboarding Questions',
    whatItDoes:
      'Add custom diagnostic questions tied directly to your workout categories. Include tailored options, helpful subtitles, and emoji icons.',
    operatorAdvice:
      'Whenever you add a question here, it automatically appears inside the mobile onboarding questionnaire for users to answer!',
  },
  {
    id: 'users-crm',
    stepNumber: 5,
    badge: 'Live CRM & Analytics',
    icon: '👥',
    title: 'User Biometrics & Stature CRM',
    subtitle: 'Real-Time Pediatric Growth Profiles',
    whatItDoes:
      'Inspect real registered users, their biological ages, predicted height ceilings, protocol streaks, and subscription statuses in real time.',
    operatorAdvice:
      'Use this to monitor protocol engagement and see how many centimeters of spinal decompression users are achieving.',
  },
]

interface AdminSpotlightTourProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSpotlightTour({ isOpen, onClose }: AdminSpotlightTourProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0)

  const step = ADMIN_TOUR_STEPS[currentIdx] || ADMIN_TOUR_STEPS[0]
  const isFirst = currentIdx === 0
  const isLast = currentIdx === ADMIN_TOUR_STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
      setCurrentIdx(0)
    } else {
      setCurrentIdx((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIdx((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    onClose()
    setCurrentIdx(0)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        {/* Spotlight Card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl glass bg-slate-950/90 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden"
        >
          {/* Top Decorative Cyan-Violet Gradient Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-600" />

          <div className="p-7">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 bg-cyan-500/10 rounded-2xl border border-cyan-500/25">
                  {step.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {step.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Step {step.stepNumber} of {ADMIN_TOUR_STEPS.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight mt-1">
                    {step.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleSkip}
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-400 mb-5">
              {step.subtitle}
            </p>

            {/* What this does block */}
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 mb-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  What Does This Feature Do?
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {step.whatItDoes}
              </p>
            </div>

            {/* Operator advice block */}
            <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Operator Best Practice
                </span>
              </div>
              <p className="text-sm text-emerald-200 leading-relaxed font-medium">
                {step.operatorAdvice}
              </p>
            </div>

            {/* Step Indicators Bar */}
            <div className="flex items-center justify-between py-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                {ADMIN_TOUR_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIdx
                        ? 'w-7 bg-cyan-400'
                        : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Jump to ${s.title}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                {!isFirst ? (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back / પાછળ</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="px-3.5 py-2.5 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Skip Tour / છોડો
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="glow-button flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  <span>{isLast ? 'Complete Tour ✓ / પૂર્ણ કરો' : 'Next Step / આગળ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

