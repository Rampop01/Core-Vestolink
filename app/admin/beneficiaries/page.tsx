"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Upload,
  Download,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react"
import { useAccount } from 'wagmi'
import { useVestolinkFactory, useVestolink, useToken } from '@/lib/hooks/useContracts'
import { shortenAddress, formatTokenAmount } from '@/lib/utils'
import { useReadContracts } from 'wagmi'
import { VESTOLINK_ABI } from '@/lib/web3'

// Component to fetch beneficiary data for a specific vestolink contract
function BeneficiaryData({ vestolinkAddress, index }: { vestolinkAddress: `0x${string}`, index: number }) {
  const { beneficiaryCount, tokenAddress } = useVestolink(vestolinkAddress)
  const { name: tokenName, symbol: tokenSymbol } = useToken(tokenAddress?.data as `0x${string}`)
  
  // For now, we'll show aggregate data per contract since individual beneficiary enumeration
  // would require additional contract methods. This shows contract-level beneficiary info.
  const beneficiaryData = useMemo(() => {
    if (!beneficiaryCount?.data || !tokenSymbol?.data) return null
    
    return {
      id: index + 1,
      address: vestolinkAddress,
      project: tokenName?.data || `Project ${index + 1}`,
      symbol: tokenSymbol.data,
      allocated: "Loading...", // Would need totalAllocated method
      claimed: "Loading...",   // Would need totalClaimed method  
      remaining: "Loading...", // Would need calculation
      status: Number(beneficiaryCount.data) > 0 ? "active" : "pending",
      lastClaim: "Loading...", // Would need lastClaim tracking
      nextUnlock: "Loading...", // Would need vesting schedule info
      beneficiaryCount: Number(beneficiaryCount.data)
    }
  }, [beneficiaryCount, tokenName, tokenSymbol, vestolinkAddress, index])
  
  return beneficiaryData
}

const statusColors = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  revoked: "bg-red-500/20 text-red-400 border-red-500/30",
}

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  completed: CheckCircle,
  revoked: AlertCircle,
}

export default function BeneficiariesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Get user's vestolink contracts
  const { address } = useAccount()
  const { userVestolinks } = useVestolinkFactory()
  const vestolinkAddresses = userVestolinks?.data || []
  
  // Batch fetch all beneficiary counts
  const beneficiaryCountContracts = vestolinkAddresses.map((address) => ({
    address: address as `0x${string}`,
    abi: VESTOLINK_ABI,
    functionName: 'getBeneficiaryCount',
  }))
  const { data: beneficiaryCountsData, isLoading: beneficiaryCountsLoading } = useReadContracts({
    contracts: beneficiaryCountContracts,
    query: {
      enabled: vestolinkAddresses.length > 0,
    },
  })

  // Aggregate stats for stat cards
  const totalBeneficiaries = useMemo(() => {
    if (!beneficiaryCountsData) return 0
    return beneficiaryCountsData.reduce((sum, result) => {
      if (result.status === 'success' && result.result) {
        return sum + Number(result.result)
      }
      return sum
    }, 0)
  }, [beneficiaryCountsData])

  const activeCount = useMemo(() => {
    if (!beneficiaryCountsData) return 0
    return beneficiaryCountsData.filter(result => result.status === 'success' && Number(result.result) > 0).length
  }, [beneficiaryCountsData])

  const pendingCount = useMemo(() => {
    if (!beneficiaryCountsData) return 0
    return beneficiaryCountsData.filter(result => result.status === 'success' && Number(result.result) === 0).length
  }, [beneficiaryCountsData])

  // Generate beneficiary data from contracts (for table)
  const beneficiaries = useMemo(() => {
    const data: any[] = []
    vestolinkAddresses.forEach((vestolinkAddress, index) => {
      // const beneficiaryData = BeneficiaryData({ vestolinkAddress, index })
      // console.log('Beneficiary data:', beneficiaryData)
      data.push({
        id: index + 1,
        address: vestolinkAddress,
        project: `Vesting Contract ${index + 1}`,
        symbol: "Loading...",
        allocated: "Loading...",
        claimed: "Loading...",
        remaining: "Loading...",
        status: "active",
        lastClaim: "Loading...",
        nextUnlock: "Loading...",
      })
    })
    return data
  }, [vestolinkAddresses])

  const isLoading = userVestolinks?.isLoading || beneficiaryCountsLoading
  const isError = userVestolinks?.isError

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const matchesSearch =
      beneficiary.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === "all" || beneficiary.project === projectFilter
    const matchesStatus = statusFilter === "all" || beneficiary.status === statusFilter
    return matchesSearch && matchesProject && matchesStatus
  })
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-300">Loading beneficiaries...</div>
        </div>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-red-400">Failed to load beneficiaries from contracts</div>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Beneficiaries</h1>
          <p className="text-gray-400">Manage vesting beneficiaries across all projects</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors text-sm shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Beneficiary</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* Stat Card: Total Beneficiaries */}
        <div className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {isLoading ? '...' : totalBeneficiaries}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Total Beneficiaries</div>
            </div>
          </div>
        </div>
        {/* Stat Card: Active */}
        <div className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {isLoading ? '...' : activeCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Active</div>
            </div>
          </div>
        </div>
        {/* Stat Card: Pending */}
        <div className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {isLoading ? '...' : pendingCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">1,157</div>
              <div className="text-xs sm:text-sm text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by address or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="all">All Projects</option>
              <option value="DeFi Protocol Token">DeFi Protocol Token</option>
              <option value="GameFi Rewards">GameFi Rewards</option>
              <option value="DAO Governance">DAO Governance</option>
              <option value="NFT Marketplace">NFT Marketplace</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Beneficiaries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 rounded-2xl border border-primary-500/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Next Unlock
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBeneficiaries.map((beneficiary, index) => {
                const StatusIcon = statusIcons[beneficiary.status as keyof typeof statusIcons]
                const progress =
                  (Number.parseInt(beneficiary.claimed.replace(/,/g, "")) /
                    Number.parseInt(beneficiary.allocated.replace(/,/g, ""))) *
                  100
                return (
                  <motion.tr
                    key={beneficiary.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-300 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs">
                          {beneficiary.address.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white">
                            {beneficiary.address.slice(0, 6)}...{beneficiary.address.slice(-4)}
                          </div>
                          <button
                            onClick={() => copyToClipboard(beneficiary.address)}
                            className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
                          >
                            Copy full address
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{beneficiary.project}</div>
                        <div className="text-sm text-gray-400">{beneficiary.symbol}</div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[beneficiary.status as keyof typeof statusColors]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{beneficiary.status}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {beneficiary.allocated} {beneficiary.symbol}
                        </div>
                        <div className="text-xs text-gray-400">Claimed: {beneficiary.claimed}</div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 w-16">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{Math.round(progress)}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white">{beneficiary.nextUnlock}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(beneficiary.address)}
                          className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
                          title="Copy Address"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredBeneficiaries.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No beneficiaries found</h3>
            <p className="text-gray-400">
              {searchTerm || projectFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Add beneficiaries to your projects to see them here"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}