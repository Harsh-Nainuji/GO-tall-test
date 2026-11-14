'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Activity,
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  Check,
  X,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileVideo,
  FileImage,
  Film,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  FolderPlus,
  Tag,
  Palette,
  Sliders,
  Eye,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCheck,
  FileText,
} from 'lucide-react'
import {
  SpinalStretch,
  WorkoutCategory,
  CategoryQuestion,
  INITIAL_CATEGORIES,
  INITIAL_CATEGORY_QUESTIONS,
} from '@/lib/admin-store'
import { uploadExerciseMedia } from '@/lib/supabase'

interface StretchesCMSProps {
  stretches: SpinalStretch[]
  onUpdateStretches: (stretches: SpinalStretch[]) => void
  categories?: WorkoutCategory[]
  onUpdateCategories?: (categories: WorkoutCategory[]) => void
  categoryQuestions?: CategoryQuestion[]
  onUpdateCategoryQuestions?: (questions: CategoryQuestion[]) => void
}

export function StretchesCMS({
  stretches,
  onUpdateStretches,
  categories = INITIAL_CATEGORIES,
  onUpdateCategories,
  categoryQuestions = INITIAL_CATEGORY_QUESTIONS,
  onUpdateCategoryQuestions,
}: StretchesCMSProps) {
  // Active Sub-tab: 'workouts' | 'categories' | 'questions'
  const [activeTab, setActiveTab] = useState<'workouts' | 'categories' | 'questions'>('workouts')

  // Search & Filter state for workouts
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all')

  // Workout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStretch, setEditingStretch] = useState<SpinalStretch | null>(null)

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<WorkoutCategory | null>(null)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('🌱')
  const [catDesc, setCatDesc] = useState('')
  const [catColor, setCatColor] = useState('#0284C7')
  const [catAssignedWorkouts, setCatAssignedWorkouts] = useState<string[]>([])

  // Category Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CategoryQuestion | null>(null)
  const [qCategoryId, setQCategoryId] = useState('')
  const [qText, setQText] = useState('')
  const [qSubtitle, setQSubtitle] = useState('')
  const [qOptions, setQOptions] = useState<
    Array<{ label: string; sublabel?: string; icon?: string }>
  >([
    { label: 'Yes, noticeable discomfort', sublabel: 'Indicates high spinal fatigue', icon: '😣' },
    { label: 'Rarely / Never', sublabel: 'Maintains optimal alignment', icon: '✨' },
  ])

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current))
    }, 4500)
  }

  // Workout Form State
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<string>('Height Growth')
  const [formZone, setFormZone] = useState<string>('Lumbar Decompression')
  const [formDuration, setFormDuration] = useState(60)
  const [formIntensity, setFormIntensity] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner')
  const [formBenefit, setFormBenefit] = useState('')
  const [formInstructions, setFormInstructions] = useState<string[]>([])
  const [instructionInput, setInstructionInput] = useState('')
  const [formContraindications, setFormContraindications] = useState('')
  const [formActive, setFormActive] = useState(true)

  // Media Upload State
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)
  const [mediaType, setMediaType] = useState<'video' | 'gif' | 'image' | undefined>(undefined)
  const [mediaFileName, setMediaFileName] = useState<string | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkRawInput, setBulkRawInput] = useState('')
  const [bulkFileName, setBulkFileName] = useState('')
  const [bulkValidatedRows, setBulkValidatedRows] = useState<
    Array<{
      rowNum: number
      title: string
      category: string
      targetZone: string
      durationSeconds: number
      intensity: 'Beginner' | 'Intermediate' | 'Advanced'
      clinicalBenefit: string
      instructions: string[]
      media_type: 'video' | 'gif' | 'image'
      media_url?: string
      isValid: boolean
      errors: string[]
    }>
  >([])

  const downloadCSVTemplate = () => {
    const csvContent =
      'title,category,targetZone,durationSeconds,intensity,clinicalBenefit,instructions,media_type,media_url\n' +
      '"Prone Cobra Thoracic Arch","Height Growth","Lumbar Lordosis",45,"Beginner","Promotes lumbar lordosis and rehydrates intervertebral discs","Lie face down; Press palms to lift chest; Breathe deeply for 45 seconds","image","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"\n' +
      '"Dead Hang Bar Traction","Height Growth","Lumbar & Thoracic",60,"Beginner","Creates axial decompression across L1-L5 spinal column","Grip overhead bar shoulder-width; Allow feet to hang freely; Relax shoulders; Step down gently","video","https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"\n' +
      '"Standing Axial Reach","Posture","Full Axial Column",45,"Beginner","De-rotates ribcage and elongates posterior longitudinal ligament before sleep","Stand tall; Interlock fingers overhead palms facing ceiling; Reach upward rising on balls of feet","image","https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'gotall_workouts_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Downloaded CSV Template!', 'success')
  }

  const downloadJSONTemplate = () => {
    const jsonContent = JSON.stringify(
      [
        {
          title: 'Prone Cobra Thoracic Arch',
          category: 'Height Growth',
          targetZone: 'Lumbar Lordosis',
          durationSeconds: 45,
          intensity: 'Beginner',
          clinicalBenefit: 'Promotes lumbar lordosis and rehydrates intervertebral discs',
          instructions: [
            'Lie face down on mat with palms beneath shoulders',
            'Press palms to lift chest',
            'Breathe deeply into abdomen for 45 seconds',
          ],
          media_type: 'image',
          media_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Dead Hang Bar Traction',
          category: 'Height Growth',
          targetZone: 'Lumbar & Thoracic',
          durationSeconds: 60,
          intensity: 'Beginner',
          clinicalBenefit: 'Creates axial decompression across L1-L5 spinal column',
          instructions: [
            'Grip overhead bar shoulder-width apart',
            'Allow feet to hang freely',
            'Relax shoulders and spine',
            'Step down smoothly',
          ],
          media_type: 'video',
          media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
      ],
      null,
      2
    )

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'gotall_workouts_template.json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Downloaded JSON Template!', 'success')
  }

  const parseCSVLine = (text: string): string[] => {
    const result: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim())
        cur = ''
      } else {
        cur += char
      }
    }
    result.push(cur.trim())
    return result
  }

  const validateAndParseBulkData = (rawText: string) => {
    setBulkRawInput(rawText)
    const trimmed = rawText.trim()
    if (!trimmed) {
      setBulkValidatedRows([])
      return
    }

    const rows: Array<{
      rowNum: number
      title: string
      category: string
      targetZone: string
      durationSeconds: number
      intensity: 'Beginner' | 'Intermediate' | 'Advanced'
      clinicalBenefit: string
      instructions: string[]
      media_type: 'video' | 'gif' | 'image'
      media_url?: string
      isValid: boolean
      errors: string[]
    }> = []

    // Try parsing as JSON first
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        const items = Array.isArray(parsed) ? parsed : [parsed]
        items.forEach((item: any, idx: number) => {
          const errors: string[] = []
          const title = String(item.title || '').trim()
          if (!title || title.length < 3) errors.push('Title must be at least 3 characters')

          const category = String(item.category || 'Height Growth').trim()
          const targetZone = String(item.targetZone || '').trim()
          if (!targetZone || targetZone.length < 3) errors.push('Target zone is required')

          const durationSeconds = Number(item.durationSeconds || 60)
          if (isNaN(durationSeconds) || durationSeconds < 15 || durationSeconds > 300) {
            errors.push('Duration must be between 15 and 300 seconds')
          }

          let intensity: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
          const rawInt = String(item.intensity || 'Beginner').trim()
          if (['Beginner', 'Intermediate', 'Advanced'].includes(rawInt)) {
            intensity = rawInt as any
          } else {
            errors.push('Intensity must be Beginner, Intermediate, or Advanced')
          }

          const clinicalBenefit = String(item.clinicalBenefit || '').trim()
          if (!clinicalBenefit || clinicalBenefit.length < 10) {
            errors.push('Clinical benefit must be at least 10 characters')
          }

          let instructions: string[] = []
          if (Array.isArray(item.instructions)) {
            instructions = item.instructions.map((ins: any) => String(ins).trim()).filter(Boolean)
          } else if (typeof item.instructions === 'string') {
            instructions = item.instructions.split(';').map((s: string) => s.trim()).filter(Boolean)
          }
          if (instructions.length === 0) {
            errors.push('At least 1 instruction step is required')
          }

          let media_type: 'video' | 'gif' | 'image' = 'image'
          if (['video', 'gif', 'image'].includes(item.media_type)) {
            media_type = item.media_type
          }

          const media_url = item.media_url ? String(item.media_url).trim() : undefined
          if (media_url && !media_url.startsWith('http')) {
            errors.push('Media URL must start with http:// or https://')
          }

          rows.push({
            rowNum: idx + 1,
            title,
            category,
            targetZone,
            durationSeconds,
            intensity,
            clinicalBenefit,
            instructions,
            media_type,
            media_url,
            isValid: errors.length === 0,
            errors,
          })
        })

        setBulkValidatedRows(rows)
        return
      } catch (e) {
        // Not JSON, fallback to CSV parsing
      }
    }

    // CSV Parsing
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      setBulkValidatedRows([])
      return
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('name'))
    const catIdx = headers.findIndex((h) => h.includes('category'))
    const zoneIdx = headers.findIndex((h) => h.includes('zone') || h.includes('target'))
    const durIdx = headers.findIndex((h) => h.includes('duration') || h.includes('seconds'))
    const intIdx = headers.findIndex((h) => h.includes('intensity') || h.includes('level'))
    const benIdx = headers.findIndex((h) => h.includes('benefit') || h.includes('clinical'))
    const insIdx = headers.findIndex((h) => h.includes('instruction') || h.includes('steps'))
    const mTypeIdx = headers.findIndex((h) => h.includes('mediatype') || h.includes('type'))
    const mUrlIdx = headers.findIndex((h) => h.includes('mediaurl') || h.includes('url'))

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const errors: string[] = []

      const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx].trim() : ''
      if (!title || title.length < 3) errors.push('Title must be at least 3 characters')

      const category = catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim() : 'Height Growth'
      const targetZone = zoneIdx !== -1 && cols[zoneIdx] ? cols[zoneIdx].trim() : ''
      if (!targetZone || targetZone.length < 3) errors.push('Target zone is required')

      const durationRaw = durIdx !== -1 && cols[durIdx] ? parseInt(cols[durIdx].trim(), 10) : 60
      const durationSeconds = isNaN(durationRaw) ? 60 : durationRaw
      if (durationSeconds < 15 || durationSeconds > 300) {
        errors.push('Duration must be between 15 and 300 seconds')
      }

      let intensity: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
      const rawInt = intIdx !== -1 && cols[intIdx] ? cols[intIdx].trim() : 'Beginner'
      if (['Beginner', 'Intermediate', 'Advanced'].includes(rawInt)) {
        intensity = rawInt as any
      } else {
        errors.push('Intensity must be Beginner, Intermediate, or Advanced')
      }

      const clinicalBenefit = benIdx !== -1 && cols[benIdx] ? cols[benIdx].trim() : ''
      if (!clinicalBenefit || clinicalBenefit.length < 10) {
        errors.push('Clinical benefit must be at least 10 characters')
      }

      const instructionsRaw = insIdx !== -1 && cols[insIdx] ? cols[insIdx].trim() : ''
      const instructions = instructionsRaw
        ? instructionsRaw.split(';').map((s) => s.trim()).filter(Boolean)
        : []
      if (instructions.length === 0) {
        errors.push('At least 1 instruction step is required (semicolon-separated)')
      }

      let media_type: 'video' | 'gif' | 'image' = 'image'
      const rawMType = mTypeIdx !== -1 && cols[mTypeIdx] ? cols[mTypeIdx].trim().toLowerCase() : ''
      if (['video', 'gif', 'image'].includes(rawMType)) {
        media_type = rawMType as any
      }

      const media_url = mUrlIdx !== -1 && cols[mUrlIdx] ? cols[mUrlIdx].trim() : undefined
      if (media_url && !media_url.startsWith('http')) {
        errors.push('Media URL must start with http:// or https://')
      }

      rows.push({
        rowNum: i,
        title,
        category,
        targetZone,
        durationSeconds,
        intensity,
        clinicalBenefit,
        instructions,
        media_type,
        media_url,
        isValid: errors.length === 0,
        errors,
      })
    }

    setBulkValidatedRows(rows)
  }

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_EXCEL_BYTES = 50 * 1024 * 1024 // 50MB limit (~500,000 rows)
    if (file.size > MAX_EXCEL_BYTES) {
      showToast('File exceeds the 50 MB maximum size limit. Please upload a smaller file or split into batches.', 'error')
      return
    }

    setBulkFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        validateAndParseBulkData(content)
      }
    }
    reader.readAsText(file)
  }

  const handleCommitBulkUpload = () => {
    const validRows = bulkValidatedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      showToast('No valid rows found to import', 'error')
      return
    }

    const newStretches: SpinalStretch[] = validRows.map((r, idx) => ({
      id: `stretch-${Date.now()}-${idx + 1}`,
      title: r.title,
      category: (r.category as any) || 'Height Growth',
      targetZone: r.targetZone,
      durationSeconds: r.durationSeconds,
      intensity: r.intensity,
      clinicalBenefit: r.clinicalBenefit,
      instructions: r.instructions,
      active: true,
      order: stretches.length + idx + 1,
      media_type: r.media_type,
      media_url: r.media_url,
    }))

    onUpdateStretches([...stretches, ...newStretches])
    showToast(`Successfully imported ${newStretches.length} workouts!`, 'success')
    setIsBulkModalOpen(false)
    setBulkRawInput('')
    setBulkValidatedRows([])
    setBulkFileName('')
  }

  // -------------------------------------------------------------
  // WORKOUT MODAL HANDLERS
  // -------------------------------------------------------------
  const openCreateModal = () => {
    setEditingStretch(null)
    setFormTitle('')
    setFormCategory(categories[0]?.name || 'Height Growth')
    setFormZone('Lumbar Decompression')
    setFormDuration(60)
    setFormIntensity('Beginner')
    setFormBenefit('')
    setFormInstructions([
      'Lie flat on a firm mat with spine aligned.',
      'Gently arch back and breathe deeply for the duration.',
      'Disengage smoothly and rest.',
    ])
    setInstructionInput('')
    setFormContraindications('')
    setFormActive(true)
    setMediaUrl(undefined)
    setMediaType(undefined)
    setMediaFileName(undefined)
    setIsModalOpen(true)
  }

  const openEditModal = (stretch: SpinalStretch) => {
    setEditingStretch(stretch)
    setFormTitle(stretch.title)
    setFormCategory(stretch.category || 'Height Growth')
    setFormZone(stretch.targetZone)
    setFormDuration(stretch.durationSeconds)
    setFormIntensity(stretch.intensity)
    setFormBenefit(stretch.clinicalBenefit)
    setFormInstructions([...stretch.instructions])
    setInstructionInput('')
    setFormContraindications(stretch.contraindications || '')
    setFormActive(stretch.active)
    setMediaUrl(stretch.media_url)
    setMediaType(stretch.media_type)
    setMediaFileName(stretch.media_url ? 'Attached Media' : undefined)
    setIsModalOpen(true)
  }

  // File Dropzone Handler
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      showToast('Selected file format or size is invalid.', 'error')
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    const MAX_VIDEO_BYTES = 15 * 1024 * 1024 // 15MB
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024  // 2MB

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4')

    if (file.size > MAX_VIDEO_BYTES) {
      showToast('File exceeds 15MB limit. Please upload a smaller video or image.', 'error')
      return
    }

    if (!isVideo && file.size > MAX_IMAGE_BYTES) {
      showToast('Image/GIF exceeds 2MB limit. Please upload a smaller file.', 'error')
      return
    }

    try {
      setIsUploading(true)
      const result = await uploadExerciseMedia(file)
      setMediaUrl(result.publicUrl)
      setMediaType(result.mediaType)
      setMediaFileName(file.name)
      showToast(`Media uploaded successfully: ${file.name}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to upload media. Please try again.', 'error')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleAddInstruction = () => {
    if (!instructionInput.trim()) return
    setFormInstructions([...formInstructions, instructionInput.trim()])
    setInstructionInput('')
  }

  const handleRemoveInstruction = (index: number) => {
    setFormInstructions(formInstructions.filter((_, i) => i !== index))
  }

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast('Please enter an exercise title', 'error')
      return
    }

    if (formInstructions.length === 0) {
      showToast('Please add at least one execution instruction step', 'error')
      return
    }

    if (editingStretch) {
      const updated = stretches.map((s) =>
        s.id === editingStretch.id
          ? {
              ...s,
              title: formTitle.trim(),
              category: formCategory as any,
              targetZone: formZone,
              durationSeconds: Number(formDuration),
              intensity: formIntensity,
              clinicalBenefit: formBenefit.trim(),
              instructions: formInstructions,
              contraindications: formContraindications.trim() || undefined,
              active: formActive,
              media_url: mediaUrl,
              media_type: mediaType,
            }
          : s
      )
      onUpdateStretches(updated)
      showToast(`Updated "${formTitle}" successfully!`, 'success')
    } else {
      const newStretch: SpinalStretch = {
        id: `stretch-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory as any,
        targetZone: formZone,
        durationSeconds: Number(formDuration),
        intensity: formIntensity,
        clinicalBenefit: formBenefit.trim(),
        instructions: formInstructions,
        contraindications: formContraindications.trim() || undefined,
        active: formActive,
        order: stretches.length + 1,
        media_url: mediaUrl,
        media_type: mediaType,
      }
      onUpdateStretches([...stretches, newStretch])
      showToast(`Added "${formTitle}" to active curriculum!`, 'success')
    }
    setIsModalOpen(false)
  }

  const sendDeleteSync = (entity: string, id: string) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
    fetch(`/api/admin/sync?entity=${entity}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    }).catch((err) => console.warn(`Failed deleting ${entity} from Supabase:`, err))
  }

  const handleDeleteWorkout = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onUpdateStretches(stretches.filter((s) => s.id !== id))
      showToast(`Deleted "${title}"`, 'info')
      sendDeleteSync('stretches', id)
    }
  }

  const handleToggleActiveWorkout = (id: string) => {
    onUpdateStretches(
      stretches.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    )
  }

  // -------------------------------------------------------------
  // CATEGORY MODAL HANDLERS (Simple for an 8 or 10-year-old kid)
  // -------------------------------------------------------------
  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCatName('')
    setCatIcon('🌱')
    setCatDesc('')
    setCatColor('#0284C7')
    setCatAssignedWorkouts([])
    setIsCategoryModalOpen(true)
  }

  const openEditCategoryModal = (cat: WorkoutCategory) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatIcon(cat.icon)
    setCatDesc(cat.description)
    setCatColor(cat.color || '#0284C7')
    setCatAssignedWorkouts([...cat.workoutIds])
    setIsCategoryModalOpen(true)
  }

  const handleToggleWorkoutAssignment = (workoutId: string) => {
    setCatAssignedWorkouts((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    )
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) {
      showToast('Please name the category', 'error')
      return
    }

    const updatedCategories = editingCategory
      ? categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: catName.trim(),
                icon: catIcon,
                description: catDesc.trim(),
                color: catColor,
                workoutIds: catAssignedWorkouts,
              }
            : c
        )
      : [
          ...categories,
          {
            id: `cat-${Date.now()}`,
            name: catName.trim(),
            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: catIcon,
            description: catDesc.trim(),
            color: catColor,
            workoutIds: catAssignedWorkouts,
            active: true,
            order: categories.length + 1,
          },
        ]

    if (onUpdateCategories) {
      onUpdateCategories(updatedCategories)
    }
    showToast(`Saved category "${catName}"!`, 'success')
    setIsCategoryModalOpen(false)
  }

  const handleDeleteCategory = (catId: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      if (onUpdateCategories) {
        onUpdateCategories(categories.filter((c) => c.id !== catId))
      }
      showToast(`Deleted category "${name}"`, 'info')
      sendDeleteSync('categories', catId)
    }
  }

  // -------------------------------------------------------------
  // CATEGORY QUESTIONS TEMPLATE HANDLERS
  // -------------------------------------------------------------
  const openCreateQuestionModal = (defaultCatId?: string) => {
    setEditingQuestion(null)
    setQCategoryId(defaultCatId || categories[0]?.id || '')
    setQText('')
    setQSubtitle('')
    setQOptions([
      { label: 'Yes, constant stiffness', sublabel: 'High spinal disc compression', icon: '😣' },
      { label: 'Rarely / Never', sublabel: 'Optimal disc hydration', icon: '✨' },
    ])
    setIsQuestionModalOpen(true)
  }

  const openEditQuestionModal = (q: CategoryQuestion) => {
    setEditingQuestion(q)
    setQCategoryId(q.categoryId)
    setQText(q.questionText)
    setQSubtitle(q.subtitle)
    setQOptions([...q.options])
    setIsQuestionModalOpen(true)
  }

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qText.trim()) {
      showToast('Please enter question text', 'error')
      return
    }

    const updatedQuestions = editingQuestion
      ? categoryQuestions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                categoryId: qCategoryId,
                questionText: qText.trim(),
                subtitle: qSubtitle.trim(),
                options: qOptions,
              }
            : q
        )
      : [
          ...categoryQuestions,
          {
            id: `cq-${Date.now()}`,
            categoryId: qCategoryId,
            questionText: qText.trim(),
            subtitle: qSubtitle.trim(),
            options: qOptions,
            active: true,
            order: categoryQuestions.length + 1,
          },
        ]

    if (onUpdateCategoryQuestions) {
      onUpdateCategoryQuestions(updatedQuestions)
    }
    showToast('Saved diagnostic question template!', 'success')
    setIsQuestionModalOpen(false)
  }

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Delete this diagnostic question?')) {
      if (onUpdateCategoryQuestions) {
        onUpdateCategoryQuestions(categoryQuestions.filter((q) => q.id !== qId))
      }
      showToast('Question deleted', 'info')
      sendDeleteSync('questions', qId)
    }
  }

  const filteredStretches = stretches.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.clinicalBenefit.toLowerCase().includes(search.toLowerCase()) ||
      s.targetZone.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      s.category === selectedCategory ||
      categories.find((c) => c.name === selectedCategory)?.workoutIds.includes(s.id)
    const matchesZone = selectedZone === 'all' || s.targetZone === selectedZone
    const matchesIntensity = selectedIntensity === 'all' || s.intensity === selectedIntensity
    return matchesSearch && matchesCategory && matchesZone && matchesIntensity
  })

  return (
    <div className="space-y-6 pb-14">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-500/10'
                : toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : 'bg-blue-50 border-blue-200 text-blue-900 shadow-blue-500/10'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-none" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 flex-none" />
            )}
            <p className="text-xs font-bold leading-snug">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Navigation Switcher */}
      <div className="p-1.5 bg-slate-900/80 rounded-2xl flex items-center gap-1 max-w-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workouts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 stroke-[2.2]" />
          <div className="flex flex-col leading-tight">
            <span>Workouts ({stretches.length})</span>
            <span className="text-[10px] font-normal opacity-75">કસરતો</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 stroke-[2.2]" />
          <div className="flex flex-col leading-tight">
            <span>Categories ({categories.length})</span>
            <span className="text-[10px] font-normal opacity-75">કેટેગરી</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 stroke-[2.2]" />
          <div className="flex flex-col leading-tight">
            <span>Questions ({categoryQuestions.length})</span>
            <span className="text-[10px] font-normal opacity-75">પ્રશ્નો</span>
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: WORKOUTS & STRETCHES CMS                                */}
      {/* ============================================================== */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {/* Top Filter & Search Bar */}
          <div className="p-5 rounded-2xl glass flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Find exercise by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Dynamic Categories Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="all">All Body Zones</option>
                <option value="Lumbar Decompression">Lower Back (Lumbar)</option>
                <option value="Thoracic Expansion">Upper Back (Thoracic)</option>
                <option value="Cervical Alignment">Neck &amp; Posture</option>
                <option value="Pelvic Neutralization">Pelvis &amp; Hips</option>
              </select>

              <select
                value={selectedIntensity}
                onChange={(e) => setSelectedIntensity(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="all">All Intensities</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 flex-none">
              {/* Bulk Upload Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setBulkRawInput('')
                  setBulkValidatedRows([])
                  setBulkFileName('')
                  setIsBulkModalOpen(true)
                }}
                className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-700/60 transition-all shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
                <div className="flex flex-col text-left leading-tight">
                  <span>Add many exercises</span>
                  <span className="text-[10px] text-slate-400 font-normal">ઘણી કસરતો ઉમેરો</span>
                </div>
              </motion.button>

              {/* Add Exercise Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={openCreateModal}
                className="px-5 py-2.5 glow-button text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md flex-none"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <div className="flex flex-col text-left leading-tight">
                  <span>+ Add Exercise</span>
                  <span className="text-[10px] font-normal opacity-80">+ કસરત ઉમેરો</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Grid of Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStretches.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl glass p-8 shadow-xs">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">No exercises in database yet / કોઈ કસરત નથી</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click &quot;Add Exercise&quot; or &quot;Add many exercises&quot; to populate your active stretching library.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2 glow-button text-xs font-bold cursor-pointer"
                  >
                    + Add Exercise
                  </button>
                  <button
                    onClick={() => {
                      setBulkRawInput('')
                      setBulkValidatedRows([])
                      setBulkFileName('')
                      setIsBulkModalOpen(true)
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    Add many exercises (Excel / CSV)
                  </button>
                </div>
              </div>
            ) : (
              filteredStretches.map((stretch) => (
              <motion.div
                key={stretch.id}
                layout
                className={`p-5 rounded-2xl glass transition-all duration-200 flex flex-col justify-between ${
                  stretch.active
                    ? 'border-slate-700/60 shadow-sm'
                    : 'border-slate-800 opacity-60 bg-slate-950/40'
                }`}
              >
                <div>
                  {/* Media Preview Thumbnail */}
                  {stretch.media_url ? (
                    <div className="relative mb-3.5 rounded-xl overflow-hidden bg-slate-950 h-32 flex items-center justify-center border border-slate-800">
                      {stretch.media_type === 'video' ? (
                        <video
                          src={stretch.media_url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={stretch.media_url}
                          alt={stretch.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-black text-white uppercase flex items-center gap-1">
                        {stretch.media_type === 'video' ? (
                          <>
                            <Film className="w-2.5 h-2.5 text-cyan-400" /> MP4 Video
                          </>
                        ) : stretch.media_type === 'gif' ? (
                          <>
                            <Film className="w-2.5 h-2.5 text-amber-400" /> GIF
                          </>
                        ) : (
                          <>
                            <FileImage className="w-2.5 h-2.5 text-emerald-400" /> Image
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Card Header & Status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 leading-snug">
                        {stretch.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-300 border-cyan-500/25 uppercase tracking-wider">
                          {stretch.category || 'Height Growth'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                          {stretch.targetZone}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          {stretch.durationSeconds}s
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleActiveWorkout(stretch.id)}
                      className={`px-2 py-0.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer border flex-none ${
                        stretch.active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-xs'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {stretch.active ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>LIVE</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>PAUSED</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Benefit Box */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="font-bold text-cyan-300 block mb-0.5">Biomechanical Benefit / ફાયદો:</span>
                    <p className="text-slate-300 leading-relaxed font-medium">{stretch.clinicalBenefit}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {stretch.active ? 'Visible in daily routine' : 'Hidden from user schedule'}
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(stretch)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
                    >
                      <Edit2 className="w-3 h-3 text-cyan-400" />
                      <span>Edit</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteWorkout(stretch.id, stretch.title)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: WORKOUT CATEGORIES & ASSIGNMENT (Kid-friendly simplicity)*/}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Workout Categories &amp; Organization</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Create custom workout categories and assign exercises with simple 1-click checkboxes.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openCreateCategoryModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 transition-all"
            >
              <FolderPlus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create Category</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat) => {
              const assignedCount = cat.workoutIds?.length || 0
              return (
                <motion.div
                  key={cat.id}
                  layout
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                          style={{ backgroundColor: `${cat.color}15`, border: `1.5px solid ${cat.color}30` }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            {assignedCount} Assigned Exercises
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Assigned Workouts Tag List */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Assigned Workouts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.workoutIds && cat.workoutIds.length > 0 ? (
                          cat.workoutIds.map((wid) => {
                            const workout = stretches.find((s) => s.id === wid)
                            return (
                              <span
                                key={wid}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                <span>{workout ? workout.title : wid}</span>
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">No workouts assigned yet.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => openCreateQuestionModal(cat.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Diagnostic Question
                    </button>

                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-black hover:bg-blue-100"
                    >
                      Manage Workouts
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CATEGORY QUESTIONS TEMPLATE                             */}
      {/* ============================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Diagnostic Onboarding Questions Template</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Questions asked in the mobile diagnostic flow for these categories to personalize the user’s routine.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => openCreateQuestionModal()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Question</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categoryQuestions.map((q) => {
              const cat = categories.find((c) => c.id === q.categoryId)
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-black text-blue-700 uppercase tracking-wider">
                        {cat ? `${cat.icon} ${cat.name}` : 'General Category'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mt-2.5">{q.questionText}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{q.subtitle}</p>

                    {/* Options list */}
                    <div className="mt-4 space-y-2">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{opt.icon || '🔹'}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                              {opt.sublabel && (
                                <p className="text-[10px] text-slate-500 font-medium">{opt.sublabel}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span>Live in Mobile Quiz flow</span>
                    <span className="text-emerald-600 font-bold">Active Template</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: WORKOUT SINGLE EXERCISE FORM (WITH DROPZONE)          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <Activity className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {editingStretch ? 'Edit Clinical Stretch' : 'New Clinical Stretch'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Configure biomechanical cues, timer duration, and media
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkout} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Exercise Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Dead Hang Disc Traction, Cobra Pose, Cat-Cow"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Zone
                    </label>
                    <select
                      value={formZone}
                      onChange={(e) => setFormZone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="Lumbar Decompression">Lower Back (Lumbar)</option>
                      <option value="Thoracic Expansion">Upper Back (Thoracic)</option>
                      <option value="Cervical Alignment">Neck &amp; Posture</option>
                      <option value="Pelvic Neutralization">Pelvis &amp; Hips</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* DRAG-AND-DROP MEDIA UPLOAD ZONE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Exercise Demonstration Media
                  </label>

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
                    }`}
                  >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                      </div>

                      {/* STRICT UI LABEL AS MANDATED BY USER PROMPT */}
                      <p className="text-sm font-extrabold text-slate-800">
                        Upload Media. GIFs/Images (Max 2MB). MP4 Video (Max 15MB).
                      </p>

                      <p className="text-xs text-slate-400 font-medium">
                        Drag and drop your file here, or click to browse
                      </p>

                      {isUploading && (
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mt-2">
                          <Activity className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to exercise-media storage...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {mediaUrl && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center flex-none">
                          {mediaType === 'video' ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 truncate max-w-xs">
                            {mediaFileName || 'Attached Exercise Media'}
                          </p>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                            {mediaType === 'video' ? 'MP4 Video' : mediaType === 'gif' ? 'GIF Animation' : 'Image'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrl(undefined)
                          setMediaType(undefined)
                          setMediaFileName(undefined)
                        }}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Biomechanical Clinical Benefit *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formBenefit}
                    onChange={(e) => setFormBenefit(e.target.value)}
                    placeholder="e.g. Relieves pressure on L1-L5 discs, pulling synovial fluid into dehydrated cartilage."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Step-by-Step Instructions ({formInstructions.length} steps) *
                  </label>

                  <div className="space-y-2 mb-2.5">
                    {formInstructions.map((ins, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center flex-none">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-medium text-slate-800 flex-1 leading-snug">
                          {ins}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveInstruction(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={instructionInput}
                      onChange={(e) => setInstructionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddInstruction()
                        }
                      }}
                      placeholder="Add an instruction step..."
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddInstruction}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add Step
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clinical Contraindications (Optional)
                  </label>
                  <input
                    type="text"
                    value={formContraindications}
                    onChange={(e) => setFormContraindications(e.target.value)}
                    placeholder="e.g. Acute disc herniation, shoulder impingement."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save to Stretches Library</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: KID-FRIENDLY CATEGORY CREATION & WORKOUT ASSIGNMENT   */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {editingCategory ? 'Edit Workout Category' : 'Create New Workout Category'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pick name, icon, and simply check which workouts belong here
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Height Growth & Spinal Decompression"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Emoji / Icon
                    </label>
                    <div className="flex items-center gap-1.5">
                      {['🌱', '📐', '⚡', '🌅', '🌙', '🧘'].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setCatIcon(emo)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all ${
                            catIcon === emo
                              ? 'bg-blue-100 border-2 border-blue-600 scale-105'
                              : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Theme Accent Color
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {['#0284C7', '#10B981', '#6366F1', '#F59E0B', '#8B5CF6', '#E11D48'].map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => setCatColor(clr)}
                          style={{ backgroundColor: clr }}
                          className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                            catColor === clr ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description / Goal
                  </label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="e.g. Axial gravity decompression and synovial fluid rehydration of compressed discs."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                {/* KID-FRIENDLY WORKOUT CHECKLIST ASSIGNMENT */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Assign Workouts ({catAssignedWorkouts.length} Selected)
                    </label>
                    <span className="text-[11px] text-blue-600 font-bold">
                      Click any exercise to assign
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    {stretches.map((st) => {
                      const isAssigned = catAssignedWorkouts.includes(st.id)
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleToggleWorkoutAssignment(st.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isAssigned
                              ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isAssigned
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-white border-slate-300'
                              }`}
                            >
                              {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">{st.title}</p>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {st.durationSeconds}s • {st.targetZone}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-black uppercase text-slate-400">
                            {st.intensity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: CATEGORY DIAGNOSTIC QUESTION TEMPLATE FORM            */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {editingQuestion ? 'Edit Diagnostic Question' : 'Add Category Diagnostic Question'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Standardized template matching the mobile onboarding design
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={qCategoryId}
                    onChange={(e) => setQCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="e.g. Do you feel back tightness after sitting at school?"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clinical Subtitle / Rationale
                  </label>
                  <input
                    type="text"
                    value={qSubtitle}
                    onChange={(e) => setQSubtitle(e.target.value)}
                    placeholder="e.g. Helps identify daily intradiscal compressive strain on lumbar vertebrae."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Dynamic Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Answer Choices ({qOptions.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setQOptions([
                          ...qOptions,
                          { label: 'New Option', sublabel: 'Clinical observation', icon: '🔹' },
                        ])
                      }
                      className="text-xs text-blue-600 font-bold hover:text-blue-700"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {qOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.icon || ''}
                            onChange={(e) => {
                              const updated = [...qOptions]
                              updated[idx].icon = e.target.value
                              setQOptions(updated)
                            }}
                            placeholder="Emoji"
                            className="w-12 px-2 py-1.5 text-center text-sm bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            required
                            value={opt.label}
                            onChange={(e) => {
                              const updated = [...qOptions]
                              updated[idx].label = e.target.value
                              setQOptions(updated)
                            }}
                            placeholder="Choice Label"
                            className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg"
                          />
                          {qOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setQOptions(qOptions.filter((_, i) => i !== idx))}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={opt.sublabel || ''}
                          onChange={(e) => {
                            const updated = [...qOptions]
                            updated[idx].sublabel = e.target.value
                            setQOptions(updated)
                          }}
                          placeholder="Clinical impact description..."
                          className="w-full px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save Question Template</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BULK UPLOAD MODAL (CSV & JSON WITH STRICT VALIDATION)          */}
        {/* ============================================================== */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Add many exercises / ઘણી કસરતો ઉમેરો
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Upload standard CSV/JSON with 100% strict clinical schema validation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 1-Click Standard Template Downloads */}
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Standard Templates / ટેમ્પલેટ</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Download template, add your exercises, and upload directly.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download CSV Template</span>
                      <Download className="w-3 h-3 text-slate-500 ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={downloadJSONTemplate}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-violet-400" />
                      <span>Download JSON Template</span>
                      <Download className="w-3 h-3 text-slate-500 ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* File Upload / Paste Area */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>Supported: CSV (Excel export), JSON, TSV</span>
                  <span className="text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px] font-bold">
                    ⚡ Max File Size: 50 MB (~500,000 rows)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: File Picker */}
                  <div className="p-5 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-950/40 hover:bg-slate-950/60 transition-all">
                    <UploadCloud className="w-8 h-8 text-cyan-400/60 mb-2" />
                    <p className="text-xs font-bold text-slate-200 mb-1">
                      {bulkFileName ? `Selected: ${bulkFileName}` : 'Choose CSV or JSON File'}
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Drag and drop or select file from device
                    </p>
                    <label className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-200 cursor-pointer shadow-xs transition-all">
                      Browse File / ફાઈલ પસંદ કરો
                      <input
                        type="file"
                        accept=".csv,.json,text/csv,application/json"
                        onChange={handleBulkFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Option B: Direct Paste */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Or Paste CSV / JSON Data</span>
                      {bulkRawInput && (
                        <button
                          type="button"
                          onClick={() => validateAndParseBulkData('')}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </label>
                    <textarea
                      rows={5}
                      value={bulkRawInput}
                      onChange={(e) => validateAndParseBulkData(e.target.value)}
                      placeholder='Paste standard CSV with header or JSON array here...'
                      className="w-full p-3 font-mono text-xs text-slate-100 bg-slate-950 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none flex-1"
                    />
                  </div>
                </div>

                {/* Live Schema Validation Summary & Table */}
                {bulkValidatedRows.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Validation Analysis ({bulkValidatedRows.length} Rows Detected)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {bulkValidatedRows.filter((r) => r.isValid).length} Valid
                          </span>
                          {bulkValidatedRows.filter((r) => !r.isValid).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {bulkValidatedRows.filter((r) => !r.isValid).length} Invalid Rows
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Validation Table */}
                    <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-950 text-slate-300 font-bold sticky top-0 border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 w-20">Status</th>
                            <th className="py-2.5 px-3">Title</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Zone</th>
                            <th className="py-2.5 px-3">Duration</th>
                            <th className="py-2.5 px-3">Clinical Benefit / Errors</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-medium">
                          {bulkValidatedRows.map((row) => (
                            <tr
                              key={row.rowNum}
                              className={row.isValid ? 'bg-slate-900/60' : 'bg-rose-950/30'}
                            >
                              <td className="py-2.5 px-3">
                                {row.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                    <Check className="w-3 h-3 stroke-[3]" /> Row {row.rowNum}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-md">
                                    <X className="w-3 h-3 stroke-[3]" /> Row {row.rowNum}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-100">
                                {row.title || <span className="text-rose-400 italic">Empty Title</span>}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300">{row.category}</td>
                              <td className="py-2.5 px-3 text-slate-300">{row.targetZone || '—'}</td>
                              <td className="py-2.5 px-3 text-slate-300">{row.durationSeconds}s</td>
                              <td className="py-2.5 px-3">
                                {row.isValid ? (
                                  <span className="text-slate-400 line-clamp-1">{row.clinicalBenefit}</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {row.errors.map((err, eIdx) => (
                                      <span
                                        key={eIdx}
                                        className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold"
                                      >
                                        {err}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
                <p className="text-xs text-slate-400 font-medium">
                  {bulkValidatedRows.filter((r) => r.isValid).length > 0
                    ? `${bulkValidatedRows.filter((r) => r.isValid).length} ready to import`
                    : 'Download template or upload file above'}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Cancel / રદ કરો
                  </button>

                  <button
                    type="button"
                    disabled={bulkValidatedRows.filter((r) => r.isValid).length === 0}
                    onClick={handleCommitBulkUpload}
                    className="px-6 py-2.5 rounded-xl glow-button disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      Save all / બધું સાચવો ({bulkValidatedRows.filter((r) => r.isValid).length})
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
