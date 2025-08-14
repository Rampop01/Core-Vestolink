"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAccount } from 'wagmi'
import { useVestolinkFactory, useVestolink, useToken } from '@/lib/hooks/useContracts'
import { formatTokenAmount, shortenAddress } from '@/lib/utils'
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Users,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react"

// Individual project component that uses hooks
function ProjectItem({ vestolinkAddress, index, isRecent = false }: { vestolinkAddress: `0x${string}`, index: number, isRecent?: boolean }) {
  const { beneficiaryCount, tokenAddress } = useVestolink(vestolinkAddress)
  const tokenData = useToken(tokenAddress?.data as `0x${string}` || '0x0000000000000000000000000000000000000000')
  
  const project = {
    id: index + 1,
    address: vestolinkAddress,
    name: tokenData?.name?.data as string || `Vesting Contract ${shortenAddress(vestolinkAddress)}`,
    symbol: tokenData?.symbol?.data as string || 'TKN',
    status: 'active' as const,
    beneficiaries: beneficiaryCount?.data ? Number(beneficiaryCount.data) : 0,
    totalTokens: '0',
    claimed: '0',
    progress: 0,
    createdAt: new Date().toISOString().split('T')[0],
    claimPage: `/claim/${vestolinkAddress}`,
    nextUnlock: 'TBD',
    network: 'Morph Holesky',
    isRecent,
  }

  const StatusIcon = statusIcons[project.status as keyof typeof statusIcons]
  
  return (
    <motion.div
      key={project.address}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`bg-slate-800/50 p-6 rounded-2xl border transition-all duration-300 ${
        project.isRecent 
          ? 'border-primary-500/50 bg-primary-500/5 ring-1 ring-primary-500/20' 
          : 'border-primary-500/20 hover:border-primary-500/40'
      }`}
    >
      {project.isRecent && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-primary-400 font-medium">Recently Deployed</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-300 rounded-lg flex items-center justify-center text-slate-900 font-bold">
            {project.symbol.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{project.name}</h3>
            <p className="text-sm text-gray-400">{shortenAddress(project.address)}</p>
          </div>
        </div>
        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${statusColors[project.status as keyof typeof statusColors]}`}
      >
        <StatusIcon className="w-3 h-3" />
        <span className="capitalize">{project.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Beneficiaries</div>
          <div className="text-sm font-medium text-white flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{project.beneficiaries}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Network</div>
          <div className="text-sm font-medium text-white">{project.network}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Total Tokens</div>
          <div className="text-sm font-medium text-white">
            {project.totalTokens || '0'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Claimed</div>
          <div className="text-sm font-medium text-white">
            {project.claimed || '0'}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
            className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/projects/${project.id}`}
            className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={project.claimPage}
            className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
            title="View Claim Page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

const statusColors = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paused: "bg-red-500/20 text-red-400 border-red-500/30",
}

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  completed: CheckCircle,
  paused: AlertCircle,
}

export default function ProjectsPage() {
  const { address: account } = useAccount()
  const { userVestolinks } = useVestolinkFactory()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Create dynamic projects from user's vestolinks
  const projects = useMemo(() => {
    if (!userVestolinks.data) return []
    return userVestolinks.data.map((address, index) => ({
      id: index + 1,
      address: address,
      name: `Project ${address.slice(0, 6)}`,
      symbol: 'TKN',
      status: 'active' as const,
      beneficiaries: 0, // Will be populated by individual hooks
      totalTokens: '0',
      claimed: '0',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      claimPage: `/claim/${address}`,
      nextUnlock: 'TBD',
      network: 'Morph Holesky',
    }))
  }, [userVestolinks.data])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Show loading state
  if (userVestolinks.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (userVestolinks.isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Failed to load projects</p>
            <p className="text-gray-400">Please check your wallet connection and try again.</p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-gray-400">Manage your token vesting projects</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/admin/deploy"
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-400 transition-colors text-sm sm:text-base shadow-sm"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>New Project</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-primary-500/20"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
            <div className="flex border border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-primary-500 text-slate-900" : "bg-slate-700 text-gray-400"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary-500 text-slate-900" : "bg-slate-700 text-gray-400"}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid/List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userVestolinks.data?.map((address, index) => (
              <ProjectItem 
                key={address} 
                vestolinkAddress={address} 
                index={index} 
                isRecent={index === 0 && userVestolinks.data && userVestolinks.data.length > 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Beneficiaries
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredProjects.map((project, index) => {
                    const StatusIcon = statusIcons[project.status as keyof typeof statusIcons]
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-300 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">
                                {project.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{project.name}</div>
                                <div className="text-sm text-gray-400">{project.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status as keyof typeof statusColors]}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span className="capitalize">{project.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-slate-700 rounded-full h-2 w-20">
                                <div
                                  className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-white">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{project.beneficiaries}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{project.network}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/projects/${project.id}`}
                                className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <a
                                href={project.claimPage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
                                title="View Claim Page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </motion.div>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first vesting project"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link
                href="/admin/deploy"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Create Project</span>
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
