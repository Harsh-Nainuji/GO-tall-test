'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { FoodItem } from '@/lib/admin-store'

interface NutritionCMSProps {
  foods: FoodItem[]
  onUpdateFoods: (foods: FoodItem[]) => void
}

export function NutritionCMS({ foods, onUpdateFoods }: NutritionCMSProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)

  // Form State
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
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this verified food item from the clinical nutrition database?')) {
      onUpdateFoods(foods.filter((f) => f.id !== id))
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
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search foods, calcium, protein..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Nutritional Categories</option>
            <option value="High Protein">High Protein</option>
            <option value="Bone Mineralization">Bone Mineralization</option>
            <option value="Bedtime Anabolic">Bedtime Anabolic</option>
            <option value="Growth Micronutrients">Growth Micronutrients</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Food</span>
        </button>
      </div>

      {/* Foods Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Food Item & Serving</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Calories</th>
                <th className="py-3 px-4">Macros (P / C / F)</th>
                <th className="py-3 px-4">Bone Minerals (Ca / Zn / D3)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.map((food) => (
                <tr
                  key={food.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !food.active ? 'opacity-60 bg-slate-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{food.name}</div>
                    <div className="text-[11px] text-slate-400">{food.servingSize}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        food.category === 'High Protein'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : food.category === 'Bone Mineralization'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : food.category === 'Bedtime Anabolic'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {food.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {food.calories} kcal
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">{food.protein}g P</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600">{food.carbs}g C</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600">{food.fat}g F</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-emerald-700">{food.calcium}mg Ca</span> •{' '}
                      <span>{food.zinc}mg Zn</span>{' '}
                      {food.vitaminD3 > 0 && (
                        <span>• <strong className="text-amber-700">{food.vitaminD3} IU D3</strong></span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(food.id)}
                      title={food.active ? 'Active on Mobile' : 'Inactive'}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        food.active
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {food.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(food)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Food"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Food"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Food */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden modal-content-animate">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingFood ? 'Edit Verified Food Item' : 'Add Verified Food Item'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Food Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greek Yogurt 0%"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serving Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 cup (200g)"
                    value={formServing}
                    onChange={(e) => setFormServing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nutritional Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="High Protein">High Protein</option>
                  <option value="Bone Mineralization">Bone Mineralization</option>
                  <option value="Bedtime Anabolic">Bedtime Anabolic</option>
                  <option value="Growth Micronutrients">Growth Micronutrients</option>
                </select>
              </div>

              {/* Macros Row */}
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCalories}
                    onChange={(e) => setFormCalories(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formProtein}
                    onChange={(e) => setFormProtein(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formCarbs}
                    onChange={(e) => setFormCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formFat}
                    onChange={(e) => setFormFat(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Bone Micronutrients */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calcium (mg)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCalcium}
                    onChange={(e) => setFormCalcium(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zinc (mg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={formZinc}
                    onChange={(e) => setFormZinc(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vitamin D3 (IU)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formVitaminD3}
                    onChange={(e) => setFormVitaminD3(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Rationale for Skeletal Growth
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this food supports epiphyseal cartilage, osteoblasts, or slow-wave sleep..."
                  value={formRationale}
                  onChange={(e) => setFormRationale(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="foodActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="foodActive" className="font-medium text-slate-700 cursor-pointer">
                  Active (available in mobile nutrition log food picker)
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
                  {editingFood ? 'Save Changes' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

