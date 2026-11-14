'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Utensils,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  Dna,
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Download,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react'
import { FoodItem } from '@/lib/admin-store'
import { uploadExerciseMedia } from '@/lib/supabase'

interface NutritionCMSProps {
  foods: FoodItem[]
  onUpdateFoods: (foods: FoodItem[]) => void
}

interface ValidatedFoodRow {
  rowNum: number
  name: string
  servingSize: string
  category: FoodItem['category']
  calories: number
  protein: number
  carbs: number
  fat: number
  calcium: number
  zinc: number
  vitaminD3: number
  clinicalRationale: string
  isValid: boolean
  errors: string[]
}

export function NutritionCMS({ foods, onUpdateFoods }: NutritionCMSProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkRawInput, setBulkRawInput] = useState('')
  const [bulkValidatedRows, setBulkValidatedRows] = useState<ValidatedFoodRow[]>([])
  const [bulkFileName, setBulkFileName] = useState('')

  // Single Item Form State
  const [formName, setFormName] = useState('')
  const [formServing, setFormServing] = useState('')
  const [formCategory, setFormCategory] = useState<FoodItem['category']>('High Protein')
  const [formCalories, setFormCalories] = useState(150)
  const [formProtein, setFormProtein] = useState(20)
  const [formCarbs, setFormCarbs] = useState(5)
  const [formFat, setFormFat] = useState(2)
  const [formCalcium, setFormCalcium] = useState(150)
  const [formZinc, setFormZinc] = useState(1.5)
  const [formVitaminD3, setFormVitaminD3] = useState(0)
  const [formRationale, setFormRationale] = useState('')
  const [formActive, setFormActive] = useState(true)

  // Direct Supabase Media Upload for Single Food
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  const onDropMedia = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setMediaFile(file)
    setIsUploadingMedia(true)

    try {
      const uploadRes = await uploadExerciseMedia(file, 'foods')
      setMediaPreviewUrl(uploadRes.publicUrl)
      showToast('Image uploaded directly to Supabase Storage!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Storage upload error', 'error')
    } finally {
      setIsUploadingMedia(false)
    }
  }, [])

  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps, isDragActive: isMediaDragActive } =
    useDropzone({
      onDrop: onDropMedia,
      accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
      maxFiles: 1,
    })

  // -------------------------------------------------------------
  // 1-CLICK TEMPLATE DOWNLOAD GENERATORS
  // -------------------------------------------------------------
  const downloadCSVTemplate = () => {
    const headers = 'name,servingSize,category,calories,protein,carbs,fat,calcium,zinc,vitaminD3,clinicalRationale\n'
    const exampleRows = [
      '"Greek Yogurt 0%","1 cup (200g)","High Protein",130,22,8,0,250,1.5,0,"Concentrated biological casein matrix supports nocturnal somatotropin pulse."',
      '"Atlantic Salmon Fillet","150g","Bone Mineralization",280,34,0,15,20,0.9,570,"Dense EPA/DHA fatty acids and natural Vitamin D3 to stimulate epiphyseal mineralization."',
      '"Raw California Almonds","1 handful (30g)","Bone Mineralization",173,6,6,15,76,0.9,0,"Dense magnesium and phosphorus source stabilizing hydroxyapatite bone crystal matrix."',
      '"Low Fat Cottage Cheese","1 cup (200g)","Bedtime Anabolic",164,28,6,2.4,138,1.3,12,"Slow-digesting micellar casein maintains positive nitrogen balance during deep sleep."',
      '"Pasture Raised Whole Eggs","2 large (100g)","Growth Micronutrients",143,12.6,0.8,9.5,56,1.3,82,"Bioavailable choline and complete branched-chain amino acids for chondrocyte proliferation."',
    ].join('\n')

    const blob = new Blob([headers + exampleRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'gotall_foods_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Downloaded Standard CSV Template!', 'success')
  }

  const downloadJSONTemplate = () => {
    const jsonContent = JSON.stringify(
      [
        {
          name: 'Greek Yogurt 0%',
          servingSize: '1 cup (200g)',
          category: 'High Protein',
          calories: 130,
          protein: 22,
          carbs: 8,
          fat: 0,
          calcium: 250,
          zinc: 1.5,
          vitaminD3: 0,
          clinicalRationale: 'Concentrated biological casein matrix supports nocturnal somatotropin pulse.',
        },
        {
          name: 'Atlantic Salmon Fillet',
          servingSize: '150g',
          category: 'Bone Mineralization',
          calories: 280,
          protein: 34,
          carbs: 0,
          fat: 15,
          calcium: 20,
          zinc: 0.9,
          vitaminD3: 570,
          clinicalRationale: 'Dense EPA/DHA fatty acids and natural Vitamin D3 to stimulate epiphyseal mineralization.',
        },
        {
          name: 'Low Fat Cottage Cheese',
          servingSize: '1 cup (200g)',
          category: 'Bedtime Anabolic',
          calories: 164,
          protein: 28,
          carbs: 6,
          fat: 2.4,
          calcium: 138,
          zinc: 1.3,
          vitaminD3: 12,
          clinicalRationale: 'Slow-digesting micellar casein maintains positive nitrogen balance during deep sleep.',
        },
      ],
      null,
      2
    )

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'gotall_foods_template.json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Downloaded Standard JSON Template!', 'success')
  }

  // -------------------------------------------------------------
  // STRICT CSV & JSON PARSER WITH 100% SCHEMA VALIDATION
  // -------------------------------------------------------------
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

    const rows: ValidatedFoodRow[] = []
    const validCategories: FoodItem['category'][] = [
      'High Protein',
      'Bone Mineralization',
      'Bedtime Anabolic',
      'Growth Micronutrients',
    ]

    // A. JSON parsing
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        const items = Array.isArray(parsed) ? parsed : [parsed]

        items.forEach((item: any, idx: number) => {
          const errors: string[] = []
          const name = String(item.name || '').trim()
          if (!name || name.length < 2) errors.push('Name must be at least 2 characters')

          const servingSize = String(item.servingSize || '').trim()
          if (!servingSize) errors.push('Serving size is required (e.g. 100g, 1 cup)')

          let category: FoodItem['category'] = 'High Protein'
          const rawCat = String(item.category || '').trim() as FoodItem['category']
          if (validCategories.includes(rawCat)) {
            category = rawCat
          } else {
            errors.push('Category must be High Protein, Bone Mineralization, Bedtime Anabolic, or Growth Micronutrients')
          }

          const calories = Number(item.calories)
          if (isNaN(calories) || calories < 0 || calories > 2500) {
            errors.push('Calories must be between 0 and 2500 kcal')
          }

          const protein = Number(item.protein)
          if (isNaN(protein) || protein < 0 || protein > 200) {
            errors.push('Protein must be between 0 and 200g')
          }

          const carbs = Number(item.carbs)
          if (isNaN(carbs) || carbs < 0 || carbs > 300) {
            errors.push('Carbs must be between 0 and 300g')
          }

          const fat = Number(item.fat)
          if (isNaN(fat) || fat < 0 || fat > 200) {
            errors.push('Fat must be between 0 and 200g')
          }

          const calcium = Number(item.calcium ?? 0)
          if (isNaN(calcium) || calcium < 0 || calcium > 3000) {
            errors.push('Calcium must be between 0 and 3000mg')
          }

          const zinc = Number(item.zinc ?? 0)
          if (isNaN(zinc) || zinc < 0 || zinc > 100) {
            errors.push('Zinc must be between 0 and 100mg')
          }

          const vitaminD3 = Number(item.vitaminD3 ?? 0)
          if (isNaN(vitaminD3) || vitaminD3 < 0 || vitaminD3 > 10000) {
            errors.push('Vitamin D3 must be between 0 and 10000 IU')
          }

          const clinicalRationale = String(item.clinicalRationale || '').trim()
          if (!clinicalRationale || clinicalRationale.length < 10) {
            errors.push('Clinical rationale must be at least 10 characters')
          }

          rows.push({
            rowNum: idx + 1,
            name,
            servingSize,
            category,
            calories: isNaN(calories) ? 0 : calories,
            protein: isNaN(protein) ? 0 : protein,
            carbs: isNaN(carbs) ? 0 : carbs,
            fat: isNaN(fat) ? 0 : fat,
            calcium: isNaN(calcium) ? 0 : calcium,
            zinc: isNaN(zinc) ? 0 : zinc,
            vitaminD3: isNaN(vitaminD3) ? 0 : vitaminD3,
            clinicalRationale,
            isValid: errors.length === 0,
            errors,
          })
        })

        setBulkValidatedRows(rows)
        return
      } catch (e) {
        // Not JSON, fall through to CSV
      }
    }

    // B. CSV parsing
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      setBulkValidatedRows([])
      return
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('food'))
    const servIdx = headers.findIndex((h) => h.includes('serv') || h.includes('portion'))
    const catIdx = headers.findIndex((h) => h.includes('cat'))
    const calIdx = headers.findIndex((h) => h.includes('cal'))
    const proIdx = headers.findIndex((h) => h.includes('prot'))
    const carbIdx = headers.findIndex((h) => h.includes('carb'))
    const fatIdx = headers.findIndex((h) => h.includes('fat'))
    const caIdx = headers.findIndex((h) => h.includes('calc') || h === 'ca')
    const znIdx = headers.findIndex((h) => h.includes('zinc') || h === 'zn')
    const d3Idx = headers.findIndex((h) => h.includes('d3') || h.includes('vitamind'))
    const ratIdx = headers.findIndex((h) => h.includes('rationale') || h.includes('benefit') || h.includes('desc'))

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const errors: string[] = []

      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : ''
      if (!name || name.length < 2) errors.push('Name must be at least 2 characters')

      const servingSize = servIdx !== -1 && cols[servIdx] ? cols[servIdx].trim() : '100g'
      if (!servingSize) errors.push('Serving size is required')

      const rawCat = catIdx !== -1 && cols[catIdx] ? cols[catIdx].trim() : 'High Protein'
      let category: FoodItem['category'] = 'High Protein'
      const matchedCat = validCategories.find((c) => c.toLowerCase() === rawCat.toLowerCase())
      if (matchedCat) {
        category = matchedCat
      } else {
        errors.push('Category must match High Protein, Bone Mineralization, Bedtime Anabolic, or Growth Micronutrients')
      }

      const calRaw = calIdx !== -1 && cols[calIdx] ? parseFloat(cols[calIdx].trim()) : 0
      const calories = isNaN(calRaw) ? 0 : calRaw
      if (calories < 0 || calories > 2500) errors.push('Calories must be between 0 and 2500 kcal')

      const proRaw = proIdx !== -1 && cols[proIdx] ? parseFloat(cols[proIdx].trim()) : 0
      const protein = isNaN(proRaw) ? 0 : proRaw
      if (protein < 0 || protein > 200) errors.push('Protein must be between 0 and 200g')

      const carbRaw = carbIdx !== -1 && cols[carbIdx] ? parseFloat(cols[carbIdx].trim()) : 0
      const carbs = isNaN(carbRaw) ? 0 : carbRaw
      if (carbs < 0 || carbs > 300) errors.push('Carbs must be between 0 and 300g')

      const fatRaw = fatIdx !== -1 && cols[fatIdx] ? parseFloat(cols[fatIdx].trim()) : 0
      const fat = isNaN(fatRaw) ? 0 : fatRaw
      if (fat < 0 || fat > 200) errors.push('Fat must be between 0 and 200g')

      const caRaw = caIdx !== -1 && cols[caIdx] ? parseFloat(cols[caIdx].trim()) : 0
      const calcium = isNaN(caRaw) ? 0 : caRaw
      if (calcium < 0 || calcium > 3000) errors.push('Calcium must be between 0 and 3000mg')

      const znRaw = znIdx !== -1 && cols[znIdx] ? parseFloat(cols[znIdx].trim()) : 0
      const zinc = isNaN(znRaw) ? 0 : znRaw
      if (zinc < 0 || zinc > 100) errors.push('Zinc must be between 0 and 100mg')

      const d3Raw = d3Idx !== -1 && cols[d3Idx] ? parseFloat(cols[d3Idx].trim()) : 0
      const vitaminD3 = isNaN(d3Raw) ? 0 : d3Raw
      if (vitaminD3 < 0 || vitaminD3 > 10000) errors.push('Vitamin D3 must be between 0 and 10000 IU')

      const clinicalRationale = ratIdx !== -1 && cols[ratIdx] ? cols[ratIdx].trim() : ''
      if (!clinicalRationale || clinicalRationale.length < 10) {
        errors.push('Clinical rationale must be at least 10 characters')
      }

      rows.push({
        rowNum: i,
        name,
        servingSize,
        category,
        calories,
        protein,
        carbs,
        fat,
        calcium,
        zinc,
        vitaminD3,
        clinicalRationale,
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
      showToast('File exceeds 50 MB limit. Please upload in smaller batches.', 'error')
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
      showToast('No valid food rows found to import', 'error')
      return
    }

    const newFoods: FoodItem[] = validRows.map((r, idx) => ({
      id: `food-${Date.now()}-${idx + 1}`,
      name: r.name,
      servingSize: r.servingSize,
      category: r.category,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      calcium: r.calcium,
      zinc: r.zinc,
      vitaminD3: r.vitaminD3,
      clinicalRationale: r.clinicalRationale,
      active: true,
    }))

    onUpdateFoods([...newFoods, ...foods])
    showToast(`Successfully imported ${newFoods.length} verified clinical foods!`, 'success')
    setIsBulkModalOpen(false)
    setBulkRawInput('')
    setBulkValidatedRows([])
    setBulkFileName('')
  }

  // -------------------------------------------------------------
  // SINGLE ITEM MODAL HANDLERS
  // -------------------------------------------------------------
  const openCreateModal = () => {
    setEditingFood(null)
    setFormName('')
    setFormServing('100g')
    setFormCategory('High Protein')
    setFormCalories(150)
    setFormProtein(20)
    setFormCarbs(5)
    setFormFat(2)
    setFormCalcium(150)
    setFormZinc(1.5)
    setFormVitaminD3(0)
    setFormRationale('')
    setFormActive(true)
    setMediaPreviewUrl(null)
    setMediaFile(null)
    setIsModalOpen(true)
  }

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food)
    setFormName(food.name)
    setFormServing(food.servingSize)
    setFormCategory(food.category)
    setFormCalories(food.calories)
    setFormProtein(food.protein)
    setFormCarbs(food.carbs)
    setFormFat(food.fat)
    setFormCalcium(food.calcium)
    setFormZinc(food.zinc)
    setFormVitaminD3(food.vitaminD3)
    setFormRationale(food.clinicalRationale)
    setFormActive(food.active)
    setMediaPreviewUrl(null)
    setMediaFile(null)
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    if (editingFood) {
      const updated = foods.map((f) =>
        f.id === editingFood.id
          ? {
            ...f,
            name: formName,
            servingSize: formServing,
            category: formCategory,
            calories: Number(formCalories),
            protein: Number(formProtein),
            carbs: Number(formCarbs),
            fat: Number(formFat),
            calcium: Number(formCalcium),
            zinc: Number(formZinc),
            vitaminD3: Number(formVitaminD3),
            clinicalRationale: formRationale,
            active: formActive,
          }
          : f
      )
      onUpdateFoods(updated)
      showToast('Food item updated successfully!', 'success')
    } else {
      const newFood: FoodItem = {
        id: `food-${Date.now()}`,
        name: formName,
        servingSize: formServing,
        category: formCategory,
        calories: Number(formCalories),
        protein: Number(formProtein),
        carbs: Number(formCarbs),
        fat: Number(formFat),
        calcium: Number(formCalcium),
        zinc: Number(formZinc),
        vitaminD3: Number(formVitaminD3),
        clinicalRationale: formRationale,
        active: formActive,
      }
      onUpdateFoods([newFood, ...foods])
      showToast('New clinical food added to database!', 'success')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this verified food item from the clinical nutrition database?')) {
      onUpdateFoods(foods.filter((f) => f.id !== id))
      showToast('Food removed from database.', 'success')

      const token = typeof window !== 'undefined' ? sessionStorage.getItem('gotall_admin_token') || 'GoTall@Admin2026' : ''
      fetch(`/api/admin/meals?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }).catch((err) => console.warn('Failed deleting meal from Supabase:', err))
    }
  }

  const handleToggleActive = (id: string) => {
    onUpdateFoods(
      foods.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    )
  }

  const filteredFoods = foods.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.clinicalRationale.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 pb-14">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border backdrop-blur-xl ${toast.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40'
              : 'bg-rose-900/90 text-rose-100 border-rose-500/40'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-none" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl glass">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search foods, calcium, protein..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 w-64 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">All Nutritional Categories</option>
            <option value="High Protein">High Protein</option>
            <option value="Bone Mineralization">Bone Mineralization</option>
            <option value="Bedtime Anabolic">Bedtime Anabolic</option>
            <option value="Growth Micronutrients">Growth Micronutrients</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bulk Upload Foods Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col text-left leading-tight">
              <span>Add many foods</span>
              <span className="text-[10px] text-slate-400 font-normal">ઘણો ખોરાક ઉમેરો</span>
            </div>
          </motion.button>

          {/* Add Verified Food Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 glow-button text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <div className="flex flex-col text-left leading-tight">
              <span>+ Add Food</span>
              <span className="text-[10px] font-normal opacity-80">+ ખોરાક ઉમેરો</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Foods Table with Sleek Glassmorphism */}
      <div className="rounded-3xl glass overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Food Item &amp; Serving</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Calories</th>
                <th className="py-3.5 px-4">Macros (P / C / F)</th>
                <th className="py-3.5 px-4">Bone Minerals (Ca / Zn / D3)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
                    <p className="font-bold text-slate-200 text-sm">No foods match the filter / કોઈ ખોરાક મળ્યો નથી</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use Add Food or Add many foods to add verified clinical items.</p>
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => (
                  <tr
                    key={food.id}
                    className={`hover:bg-slate-800/40 transition-colors ${!food.active ? 'opacity-60 bg-slate-950/40' : ''
                      }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-100 text-sm">{food.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{food.servingSize}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${food.category === 'High Protein'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : food.category === 'Bone Mineralization'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : food.category === 'Bedtime Anabolic'
                              ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                      >
                        {food.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {food.calories} kcal
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-cyan-400">{food.protein}g P</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-300">{food.carbs}g C</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400">{food.fat}g F</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                        <span title="Calcium">{food.calcium}mg Ca</span>
                        <span className="text-slate-300">•</span>
                        <span title="Zinc">{food.zinc}mg Zn</span>
                        <span className="text-slate-300">•</span>
                        <span title="Vitamin D3">{food.vitaminD3} IU D3</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(food.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${food.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                      >
                        {food.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(food)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Food"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: FOOD BULK UPLOAD MODAL WITH 100% SCHEMA VALIDATION    */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Add many foods / ઘણો ખોરાક ઉમેરો
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Upload standard CSV/JSON with 100% strict clinical macro &amp; micronutrient validation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 1-Click Standard Template Downloads */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Standardized Clinical Nutrition Templates</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Download the template, fill in your foods and macros, and upload directly.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download CSV Template</span>
                      <Download className="w-3 h-3 text-slate-400 ml-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={downloadJSONTemplate}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download JSON Template</span>
                      <Download className="w-3 h-3 text-slate-400 ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* File Upload / Paste Area */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>Supported: CSV (Excel export), JSON, TSV</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] font-black">
                    ⚡ Max File Size: 50 MB (~500,000 rows)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: File Picker */}
                  <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700 mb-1">
                      {bulkFileName ? `Selected: ${bulkFileName}` : 'Choose CSV or JSON File'}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Drag and drop or select file from device
                    </p>
                    <label className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-all">
                      Browse File
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
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Or Paste CSV / JSON Data</span>
                      {bulkRawInput && (
                        <button
                          type="button"
                          onClick={() => validateAndParseBulkData('')}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
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
                      className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none flex-1"
                    />
                  </div>
                </div>

                {/* Live Schema Validation Summary & Table */}
                {bulkValidatedRows.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Validation Analysis ({bulkValidatedRows.length} Rows Detected)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {bulkValidatedRows.filter((r) => r.isValid).length} Valid
                          </span>
                          {bulkValidatedRows.filter((r) => !r.isValid).length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              {bulkValidatedRows.filter((r) => !r.isValid).length} Invalid Rows
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Validation Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 w-20">Status</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Calories</th>
                            <th className="py-2.5 px-3">Macros</th>
                            <th className="py-2.5 px-3">Errors / Rationale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {bulkValidatedRows.map((row) => (
                            <tr
                              key={row.rowNum}
                              className={row.isValid ? 'bg-white' : 'bg-rose-50/60'}
                            >
                              <td className="py-2.5 px-3">
                                {row.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                    <Check className="w-3 h-3 stroke-[3]" /> Row {row.rowNum}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                    <AlertCircle className="w-3 h-3" /> Row {row.rowNum}
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {row.name || <span className="text-rose-500 italic">Missing</span>}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="text-[11px] font-bold text-slate-700">{row.category}</span>
                              </td>

                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {row.calories} kcal
                              </td>

                              <td className="py-2.5 px-3 font-semibold text-blue-600">
                                {row.protein}P / {row.carbs}C / {row.fat}F
                              </td>

                              <td className="py-2.5 px-3 max-w-xs">
                                {row.isValid ? (
                                  <p className="text-[11px] text-slate-500 truncate font-normal">
                                    {row.clinicalRationale}
                                  </p>
                                ) : (
                                  <div className="space-y-0.5">
                                    {row.errors.map((err, eIdx) => (
                                      <p key={eIdx} className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                        • {err}
                                      </p>
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
              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel / રદ કરો
                </button>

                <button
                  type="button"
                  disabled={bulkValidatedRows.filter((r) => r.isValid).length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-6 py-2.5 rounded-xl glow-button disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    Save all / બધું સાચવો ({bulkValidatedRows.filter((r) => r.isValid).length})
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: SINGLE FOOD ADD / EDIT MODAL WITH DIRECT SUPABASE MEDIA */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100"
            >
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Utensils className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      {editingFood ? 'Edit Food / ખોરાક બદલો' : 'Add Food / ખોરાક ઉમેરો'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Configure serving, macros, and bone mineralization micronutrients
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Food Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greek Yogurt 0%"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Serving Size *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 cup (200g)"
                      value={formServing}
                      onChange={(e) => setFormServing(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">Nutritional Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="High Protein">High Protein</option>
                    <option value="Bone Mineralization">Bone Mineralization</option>
                    <option value="Bedtime Anabolic">Bedtime Anabolic</option>
                    <option value="Growth Micronutrients">Growth Micronutrients</option>
                  </select>
                </div>

                {/* Direct Supabase Storage Photo Upload */}
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Food Image (Direct Supabase Storage Upload)
                  </label>
                  <div
                    {...getMediaRootProps()}
                    className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isMediaDragActive
                      ? 'border-cyan-400 bg-cyan-950/40'
                      : 'border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
                      }`}
                  >
                    <input {...getMediaInputProps()} />
                    {isUploadingMedia ? (
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading directly to Supabase...</span>
                      </div>
                    ) : mediaPreviewUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={mediaPreviewUrl}
                          alt="Uploaded Food"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Uploaded to Supabase
                          </p>
                          <p className="text-[10px] text-slate-400">Click or drag another to replace</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-300">Drop image here or click to browse</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Stored in Supabase 'exercise-media/foods' bucket</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Macros Row */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formCalories}
                      onChange={(e) => setFormCalories(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={formProtein}
                      onChange={(e) => setFormProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={formCarbs}
                      onChange={(e) => setFormCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={formFat}
                      onChange={(e) => setFormFat(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                    />
                  </div>
                </div>

                {/* Bone Micronutrients */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Calcium (mg)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formCalcium}
                      onChange={(e) => setFormCalcium(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Zinc (mg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={formZinc}
                      onChange={(e) => setFormZinc(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">Vitamin D3 (IU)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formVitaminD3}
                      onChange={(e) => setFormVitaminD3(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Clinical Rationale for Skeletal Growth
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Explain why this food supports epiphyseal cartilage, osteoblasts, or slow-wave sleep..."
                    value={formRationale}
                    onChange={(e) => setFormRationale(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="foodActive"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                  />
                  <label htmlFor="foodActive" className="font-bold text-slate-300 cursor-pointer">
                    Active (visible in mobile nutrition log food catalog)
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 font-bold cursor-pointer"
                  >
                    Cancel / રદ કરો
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 glow-button text-slate-950 font-bold cursor-pointer shadow-md transition-all"
                  >
                    {editingFood ? 'Save / સાચવો' : '+ Add Food / + ઉમેરો'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
