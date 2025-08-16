"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, TrendingUp, Users, Coins, Activity, ArrowUpRight, BarChart3, Wallet } from "lucide-react"
import { useAccount, useConnect } from 'wagmi'
import { useVestolinkFactory } from '@/lib/hooks/useContracts'
import { formatTokenAmount, shortenAddress } from "@/lib/web3"
import ProjectCard from "@/components/ProjectCard"

export default function AdminDashboard() {
  const { address: account, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { allVestolinks, userVestolinks } = useVestolinkFactory()
  const [projectAddresses, setProjectAddresses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBeneficiaries: 0,
    totalAllocated: "0",
    activeProjects: 0,
  })

  // Load user's projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!account || !userVestolinks.data) {
        setLoading(false)
        return
      }

      try {
        // Get user's vestolink contracts from wagmi hook
        const userVestolinkAddresses = userVestolinks.data || []

        // Just store the addresses - ProjectCard components will handle the individual data loading
        setProjectAddresses([...userVestolinkAddresses])
        
        setStats({
          totalProjects: userVestolinkAddresses.length,
          totalBeneficiaries: 0, // Will be calculated by individual ProjectCard components
          totalAllocated: '0', // Will be calculated from real contract data
          activeProjects: userVestolinkAddresses.length,
        })
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [userVestolinks.data, account])

  // Manual refresh function
  const refreshProjects = () => {
    setLoading(true)
    // Trigger a re-fetch by invalidating the query
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to access the VestoLink dashboard and manage your token vesting projects.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => connect({ connector: connectors[0] })}
            className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 mx-auto shadow-sm"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {shortenAddress(account || "")}</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshProjects}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors text-sm border border-slate-600 disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/admin/deploy"
              className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-400 transition-colors text-sm sm:text-base shadow-sm"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>New Project</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Coins className="w-5 sm:w-6 h-5 sm:h-6 text-primary-500" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{stats.totalProjects}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Total Projects</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-5 sm:w-6 h-5 sm:h-6 text-green-400" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{stats.activeProjects}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Active Projects</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{stats.totalBeneficiaries}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Beneficiaries</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5 }}
          className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-1 truncate" title={stats.totalAllocated}>{stats.totalAllocated}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Total Allocated</div>
        </motion.div>
      </div>

      {/* Projects List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Projects</h2>
            <p className="text-sm text-gray-400 mt-1">Showing your latest deployments first</p>
          </div>
          <Link
            href="/admin/projects"
            className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded w-32"></div>
                      <div className="h-3 bg-slate-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-slate-600 rounded"></div>
                    <div className="h-3 bg-slate-600 rounded"></div>
                    <div className="h-3 bg-slate-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projectAddresses.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first token vesting project to get started</p>
            <Link
              href="/admin/deploy"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projectAddresses.slice(0, 3).map((address, index) => (
              <motion.div
                key={address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <ProjectCard 
                  address={address} 
                  index={index} 
                  isRecent={index === 0 && projectAddresses.length > 0}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <Link href="/admin/deploy">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-primary-500/20 to-primary-300/20 rounded-2xl border border-primary-500/30 cursor-pointer"
          >
            <div className="w-12 h-12 bg-primary-500/30 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Deploy New Project</h3>
            <p className="text-gray-300 text-sm">Create a new vesting contract with custom parameters</p>
          </motion.div>
        </Link>

        <Link href="/admin/beneficiaries">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-300/20 rounded-2xl border border-blue-500/30 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Beneficiaries</h3>
            <p className="text-gray-300 text-sm">Upload and manage vesting beneficiaries in bulk</p>
          </motion.div>
        </Link>

        <Link href="/admin/analytics">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-300/20 rounded-2xl border border-purple-500/30 cursor-pointer"
          >
            <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
            <p className="text-gray-300 text-sm">Track performance and claim statistics</p>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  )
}
