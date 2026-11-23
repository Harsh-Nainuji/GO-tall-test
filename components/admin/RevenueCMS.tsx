'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { AdminPayment, SubscriptionPlan, UserBiometricProfile } from '@/lib/admin-store'

interface RevenueCMSProps {
  payments: AdminPayment[]
  plans: SubscriptionPlan[]
  users: UserBiometricProfile[]
  onRefresh?: () => void
}

export function RevenueCMS({
  payments,
  plans,
  users,
  onRefresh,
}: RevenueCMSProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')

  // Calculate high-level financial metrics
  const stats = useMemo(() => {
    let totalGrossCents = 0
    let successfulCount = 0

    payments.forEach((p) => {
      if (p.status?.toLowerCase() === 'success' || !p.status) {
        totalGrossCents += p.amountPaise || 0
        successfulCount++
      }
    })

    const grossRevenueUsd = totalGrossCents / 100

    // Compute active paying users
    const payingUsers = users.filter((u) => u.subscriptionTier && u.subscriptionTier !== 'Free')
    const payingCount = payingUsers.length || Math.max(1, successfulCount)

    // Calculate MRR estimate
    let estimatedMrr = 0
    payingUsers.forEach((u) => {
      if (u.subscriptionTier?.includes('Annual')) {
        estimatedMrr += 4.99
      } else if (u.subscriptionTier?.includes('Monthly')) {
        estimatedMrr += 9.99
      }
    })
    // Fallback if users list doesn't have tiers populated
    if (estimatedMrr === 0 && successfulCount > 0) {
      estimatedMrr = successfulCount * 9.99
    }

    const estimatedArr = estimatedMrr * 12
    const averageOrderValue = successfulCount > 0 ? grossRevenueUsd / successfulCount : 0

    return {
      grossRevenueUsd,
      successfulCount,
      payingCount,
      estimatedMrr,
      estimatedArr,
      averageOrderValue,
    }
  }, [payments, users])

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.planName?.toLowerCase().includes(q) ||
        p.originalTransactionId?.toLowerCase().includes(q) ||
        p.userEmail?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)

      const matchesPlan =
        selectedPlanFilter === 'all' ||
        p.planName?.toLowerCase().includes(selectedPlanFilter.toLowerCase())

      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (p.status || 'success').toLowerCase() === selectedStatusFilter.toLowerCase()

      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [payments, searchQuery, selectedPlanFilter, selectedStatusFilter])

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Customer Email', 'Plan Name', 'Amount (USD)', 'Status', 'Date']
    const rows = filteredPayments.map((p) => [
      p.originalTransactionId || p.id,
      p.userEmail || 'customer@gotall.app',
      p.planName,
      `$${(p.amountPaise / 100).toFixed(2)}`,
      p.status || 'success',
      new Date(p.createdAt).toISOString(),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `gotall_revenue_ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Financial Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {formatCurrency(stats.grossRevenueUsd)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time processed volume</span>
            </div>
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated MRR</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {formatCurrency(stats.estimatedMrr)}
              <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-400">
              ARR Run-Rate: {formatCurrency(stats.estimatedArr)}
            </div>
          </div>
        </div>

        {/* Active Paying Subscribers */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Paid Users</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {stats.payingCount}
              <span className="text-xs font-normal text-slate-500 ml-1.5">subscribers</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-400">
              Across Monthly, Annual &amp; VIP
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Transaction Value</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-400">
              {stats.successfulCount} total invoices recorded
            </div>
          </div>
        </div>
      </div>

      {/* Plan Performance Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-cyan-400" />
          <span>Active Catalog Plan Distribution</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {plans.map((p) => {
            const countForPlan = payments.filter((pay) =>
              pay.planName?.toLowerCase().includes(p.name.toLowerCase()) ||
              (p.interval === 'yearly' && pay.planName?.toLowerCase().includes('annual')) ||
              (p.interval === 'monthly' && pay.planName?.toLowerCase().includes('monthly')) ||
              (p.interval === 'lifetime' && pay.planName?.toLowerCase().includes('lifetime'))
            ).length

            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-100">{p.name}</span>
                    {p.badgeLabel && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white"
                        style={{ backgroundColor: p.badgeColor || '#0284C7' }}
                      >
                        {p.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ${p.priceUsd} / {p.interval}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-cyan-300">{countForPlan}</div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Purchases</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md overflow-hidden">
        {/* Ledger Toolbar */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transaction, ID, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            {/* Plan Filter */}
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
              <option value="lifetime">Lifetime</option>
              <option value="free">Free</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh Ledger"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-bold text-slate-400">No Transactions Found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      New mobile app subscriptions and plan upgrades will appear here in real time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const displayAmount = `$${(p.amountPaise / 100).toFixed(2)}`
                  const txnCode = p.originalTransactionId || p.id

                  const isAnnual = p.planName?.toLowerCase().includes('annual')
                  const isLifetime = p.planName?.toLowerCase().includes('lifetime')
                  const isMonthly = p.planName?.toLowerCase().includes('monthly')

                  const badgeBg = isAnnual
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : isLifetime
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/25'
                    : isMonthly
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                    : 'bg-slate-800 text-slate-300 border-slate-700'

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          {txnCode.length > 20 ? `${txnCode.slice(0, 10)}...${txnCode.slice(-6)}` : txnCode}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-200">
                          {p.userName || 'Verified Member'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.userEmail || (p.userId ? `User: ${p.userId.slice(0, 8)}...` : 'mobile_subscriber')}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeBg}`}>
                          {p.planName}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-black text-slate-100 text-sm">
                        {displayAmount}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>SUCCESS</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
