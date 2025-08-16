"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Pause, Play, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Coins, Download, ExternalLink, Edit, Trash2, BarChart3 } from "lucide-react"
import { useAccount, useConnect } from 'wagmi'
import { useVestolink, useToken } from '@/lib/hooks/useContracts'
import { formatTokenAmount, shortenAddress } from "@/lib/utils"
import { getExplorerUrl, VESTOLINK_ABI } from '@/lib/web3'

interface BeneficiaryData {
  address: string
  totalAmount: string
  claimedAmount: string
  claimableAmount: string
  lastClaimDate: string
  progress: number
  status: 'active' | 'revoked' | 'completed'
}

interface ProjectData {
  address: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  isActive: boolean
  beneficiaryCount: number
  totalAllocated: string
  totalClaimed: string
  createdAt: string
}

interface VestingTemplate {
  startTime: number
  cliffDuration: number
  totalDuration: number
  releaseInterval: number
  earlyClaimPercentage: number
  earlyClaimEnabled: boolean
  isActive: boolean
}

export default function ProjectManagePage({ params }: { params: { address: string } }) {
  const { address: account, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const vestolinkAddress = params.address as `0x${string}`
  
  // Use contract hooks - some are commented out until you add functions to smart contract
  const { vestingSchedule, beneficiaryCount, tokenAddress } = useVestolink(vestolinkAddress)
  // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD THESE FUNCTIONS TO YOUR SMART CONTRACT:
  // const { vestingTemplate, pauseContract, unpauseContract, addBeneficiaries } = useVestolink(vestolinkAddress)
  
  // Get token information if we have the token address
  const tokenData = useToken(tokenAddress?.data as `0x${string}` || '0x0000000000000000000000000000000000000000')
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([])
  const [vestingTemplateData, setVestingTemplateData] = useState<VestingTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'analytics'>('overview')
  
  // Add beneficiary modal state
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false)
  const [newBeneficiaries, setNewBeneficiaries] = useState([{ address: '', amount: '' }])
  const [isAddingBeneficiaries, setIsAddingBeneficiaries] = useState(false)
  
  // Contract control state
  const [isPausing, setIsPausing] = useState(false)

  useEffect(() => {
    const loadProjectData = async () => {
      if (!account || !isConnected) {
        setLoading(false)
        return
      }

      try {
        // Calculate real project statistics from available data
        let totalAllocated = '0'
        let totalClaimed = '0'
        
        if (account && vestingSchedule?.data) {
          const scheduleData = vestingSchedule.data as any
          totalAllocated = scheduleData.totalAmount?.toString() || '0'
          totalClaimed = scheduleData.claimedAmount?.toString() || '0'
        }

        // Load project data from contract
        setProjectData({
          address: vestolinkAddress,
          tokenAddress: tokenAddress?.data as string || '0x0000000000000000000000000000000000000000',
          tokenName: tokenData?.name?.data as string || 'Unknown Token',
          tokenSymbol: tokenData?.symbol?.data as string || 'UNK',
          isActive: true, // Will be from isActive hook when available
          beneficiaryCount: Number(beneficiaryCount?.data || 0),
          totalAllocated,
          totalClaimed,
          createdAt: new Date().toISOString().split('T')[0], // Will get from contract deployment events
        })

        // Load vesting template from contract
        // 🚧 Using vestingSchedule data until vestingTemplate hook is available
        if (vestingSchedule?.data) {
          const scheduleData = vestingSchedule.data as any
          setVestingTemplateData({
            startTime: scheduleData.startTime || Math.floor(Date.now() / 1000),
            cliffDuration: scheduleData.cliffDuration || 0,
            totalDuration: scheduleData.totalDuration || 0,
            releaseInterval: scheduleData.releaseInterval || 0,
            earlyClaimPercentage: scheduleData.earlyClaimPercentage || 0,
            earlyClaimEnabled: scheduleData.earlyClaimEnabled || false,
            isActive: true, // Will be from isActive hook when available
          })
        } else {
          // No vesting template data available yet
          setVestingTemplateData({
            startTime: 0,
            cliffDuration: 0,
            totalDuration: 0,
            releaseInterval: 0,
            earlyClaimPercentage: 0,
            earlyClaimEnabled: false,
            isActive: false,
          })
        }

        // Load beneficiaries data from contract
        // 🚧 Real beneficiary enumeration will require additional contract functions
        // For now, only show current user if they have a vesting schedule
        const currentUserBeneficiaries = []
        if (account && vestingSchedule?.data) {
          const scheduleData = vestingSchedule.data as any
          currentUserBeneficiaries.push({
            address: account,
            totalAmount: scheduleData.totalAmount?.toString() || '0',
            claimedAmount: scheduleData.claimedAmount?.toString() || '0',
            claimableAmount: '0', // Will be calculated from getClaimableAmount
            lastClaimDate: scheduleData.claimedAmount > 0 ? 'Recently' : 'Never',
            progress: scheduleData.totalAmount > 0 
              ? Math.round((Number(scheduleData.claimedAmount) / Number(scheduleData.totalAmount)) * 100) 
              : 0,
            status: scheduleData.revoked ? 'revoked' as const : 'active' as const,
          })
        }
        setBeneficiaries(currentUserBeneficiaries)

      } catch (error) {
        console.error("Error loading project data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [account, isConnected, vestolinkAddress, vestingSchedule?.data, beneficiaryCount?.data, tokenAddress?.data, tokenData?.name?.data, tokenData?.symbol?.data])

  const handleAddBeneficiaries = async () => {
    if (!account || !isConnected) {
      await connect({ connector: connectors[0] })
      return
    }

    const validBeneficiaries = newBeneficiaries.filter(b => b.address && b.amount)
    if (validBeneficiaries.length === 0) {
      alert("Please add at least one valid beneficiary")
      return
    }

    setIsAddingBeneficiaries(true)
    try {
      // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD addBeneficiaries FUNCTION TO YOUR SMART CONTRACT:
      /*
      const addresses = validBeneficiaries.map(b => b.address as `0x${string}`)
      const amounts = validBeneficiaries.map(b => BigInt(parseFloat(b.amount) * 1e18))

      await addBeneficiaries.writeContractAsync({
        address: vestolinkAddress,
        abi: VESTOLINK_ABI,
        functionName: 'addBeneficiaries',
        args: [addresses, amounts],
      })

      // Refresh data
      window.location.reload()
      */
      
      // Temporary placeholder until smart contract is updated
      alert("Add beneficiaries function not yet implemented in smart contract")
    } catch (error: any) {
      console.error("Add beneficiaries error:", error)
      alert(`Failed to add beneficiaries: ${error.message}`)
    } finally {
      setIsAddingBeneficiaries(false)
    }
  }

  const handlePauseContract = async () => {
    if (!account || !isConnected) {
      await connect({ connector: connectors[0] })
      return
    }

    setIsPausing(true)
    try {
      // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD pause/unpause FUNCTIONS TO YOUR SMART CONTRACT:
      /*
      if (projectData?.isActive) {
        await pauseContract.writeContractAsync({
          address: vestolinkAddress,
          abi: VESTOLINK_ABI,
          functionName: 'pause',
        })
      } else {
        await unpauseContract.writeContractAsync({
          address: vestolinkAddress,
          abi: VESTOLINK_ABI,
          functionName: 'unpause',
        })
      }

      // Refresh data
      window.location.reload()
      */
      
      // Temporary placeholder until smart contract is updated
      alert(`Pause/unpause function not yet implemented in smart contract`)
    } catch (error: any) {
      console.error("Pause/unpause error:", error)
      alert(`Failed to ${projectData?.isActive ? 'pause' : 'unpause'} contract: ${error.message}`)
    } finally {
      setIsPausing(false)
    }
  }

  const addNewBeneficiaryRow = () => {
    setNewBeneficiaries([...newBeneficiaries, { address: '', amount: '' }])
  }

  const removeBeneficiaryRow = (index: number) => {
    setNewBeneficiaries(newBeneficiaries.filter((_, i) => i !== index))
  }

  const updateBeneficiary = (index: number, field: 'address' | 'amount', value: string) => {
    const updated = [...newBeneficiaries]
    updated[index][field] = value
    setNewBeneficiaries(updated)
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to manage this vesting project.</p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project data...</p>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-gray-400 mb-6">The requested vesting project could not be found.</p>
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-300 rounded-xl flex items-center justify-center text-slate-900 font-bold text-lg">
              {projectData.tokenSymbol.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{projectData.tokenName}</h1>
              <p className="text-gray-400">{projectData.tokenSymbol} • {shortenAddress(projectData.address)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePauseContract}
            disabled={isPausing}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
              projectData.isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            } disabled:opacity-50`}
          >
            {isPausing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : projectData.isActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{projectData.isActive ? 'Pause' : 'Resume'}</span>
          </button>
          
          <button
            onClick={() => setShowAddBeneficiary(true)}
            className="px-4 py-2 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Beneficiaries</span>
          </button>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6 mb-8"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${projectData.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <div className="font-semibold text-white">{projectData.isActive ? 'Active' : 'Paused'}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Beneficiaries</div>
              <div className="font-semibold text-white">{beneficiaries.length}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Coins className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm text-gray-400">Total Allocated</div>
              <div className="font-semibold text-white">{Number.parseFloat(projectData.totalAllocated).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Total Claimed</div>
              <div className="font-semibold text-white">{Number.parseFloat(projectData.totalClaimed).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 mb-8"
      >
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-slate-900'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Vesting Schedule */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vesting Schedule</h3>
              {vestingTemplateData && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date:</span>
                    <span className="text-white">{new Date(vestingTemplateData.startTime * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cliff Period:</span>
                    <span className="text-white">{Math.floor(vestingTemplateData.cliffDuration / (24 * 60 * 60))} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Duration:</span>
                    <span className="text-white">{Math.floor(vestingTemplateData.totalDuration / (24 * 60 * 60))} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Release Interval:</span>
                    <span className="text-white">{Math.floor(vestingTemplateData.releaseInterval / (24 * 60 * 60))} days</span>
                  </div>
                  {vestingTemplateData.earlyClaimEnabled && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Early Claim:</span>
                      <span className="text-white">{vestingTemplateData.earlyClaimPercentage}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contract Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Vesting Contract</div>
                  <div className="text-sm text-white font-mono flex items-center justify-between">
                    <span>{shortenAddress(projectData.address)}</span>
                    <a
                      href={getExplorerUrl(projectData.address, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Token Contract</div>
                  <div className="text-sm text-white font-mono flex items-center justify-between">
                    <span>{shortenAddress(projectData.tokenAddress)}</span>
                    <a
                      href={getExplorerUrl(projectData.tokenAddress, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Created</div>
                  <div className="text-sm text-white">{projectData.createdAt}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beneficiaries' && (
          <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Beneficiaries ({beneficiaries.length})</h3>
              <button
                onClick={() => setShowAddBeneficiary(true)}
                className="px-4 py-2 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Allocated</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Claimed</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Available</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((beneficiary, index) => (
                    <tr key={beneficiary.address} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm text-white">{shortenAddress(beneficiary.address)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-white">{Number.parseFloat(beneficiary.totalAmount).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-white">{Number.parseFloat(beneficiary.claimedAmount).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-white">{Number.parseFloat(beneficiary.claimableAmount).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2 w-16">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full"
                              style={{ width: `${beneficiary.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-white">{beneficiary.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          beneficiary.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          beneficiary.status === 'revoked' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {beneficiary.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Claim Activity */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Claim Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Claims:</span>
                  <span className="text-white font-semibold">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last 30 Days:</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Claim Size:</span>
                  <span className="text-white font-semibold">5,952 {projectData.tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion Rate:</span>
                  <span className="text-white font-semibold">25%</span>
                </div>
              </div>
            </div>

            {/* Token Distribution */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Token Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Allocated:</span>
                  <span className="text-white font-semibold">{Number.parseFloat(projectData.totalAllocated).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Claimed:</span>
                  <span className="text-white font-semibold">{Number.parseFloat(projectData.totalClaimed).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Remaining:</span>
                  <span className="text-white font-semibold">
                    {(Number.parseFloat(projectData.totalAllocated) - Number.parseFloat(projectData.totalClaimed)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-300 h-3 rounded-full"
                    style={{ 
                      width: `${(Number.parseFloat(projectData.totalClaimed) / Number.parseFloat(projectData.totalAllocated)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Real Analytics Based on Contract Data */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Claiming Statistics */}
              <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Claiming Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Beneficiaries:</span>
                    <span className="text-white font-semibold">{projectData.beneficiaryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Allocated:</span>
                    <span className="text-white font-semibold">{Number.parseFloat(projectData.totalAllocated).toLocaleString()} {projectData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Claimed:</span>
                    <span className="text-green-400 font-semibold">{Number.parseFloat(projectData.totalClaimed).toLocaleString()} {projectData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Claim Rate:</span>
                    <span className="text-primary-400 font-semibold">
                      {projectData.totalAllocated !== '0' 
                        ? `${Math.round((Number.parseFloat(projectData.totalClaimed) / Number.parseFloat(projectData.totalAllocated)) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Information */}
              <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Token Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Name:</span>
                    <span className="text-white font-semibold">{projectData.tokenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-white font-semibold">{projectData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">{shortenAddress(projectData.tokenAddress)}</span>
                      <a
                        href={getExplorerUrl(projectData.tokenAddress, "address")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${projectData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {projectData.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vesting Progress Chart Placeholder */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vesting Progress</h3>
              {vestingTemplateData && vestingTemplateData.totalDuration > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vesting Period:</span>
                    <span className="text-white">
                      {new Date(vestingTemplateData.startTime * 1000).toLocaleDateString()} - 
                      {new Date((vestingTemplateData.startTime + vestingTemplateData.totalDuration) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    {(() => {
                      const now = Math.floor(Date.now() / 1000)
                      const elapsed = Math.max(0, now - vestingTemplateData.startTime)
                      const progress = Math.min(100, (elapsed / vestingTemplateData.totalDuration) * 100)
                      return (
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-300 h-4 rounded-full flex items-center justify-center"
                          style={{ width: `${progress}%` }}
                        >
                          <span className="text-xs text-slate-900 font-semibold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Start</span>
                    <span>Current Progress</span>
                    <span>End</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Vesting schedule data not available</p>
                  <p className="text-sm">This will show real progress when vesting template is loaded from contract</p>
                </div>
              )}
            </div>

            {/* Beneficiary Status Overview */}
            <div className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Beneficiary Overview</h3>
              {beneficiaries.length > 0 ? (
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary, index) => (
                    <div key={beneficiary.address} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <span className="text-primary-400 text-sm font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white font-mono text-sm">{shortenAddress(beneficiary.address)}</div>
                          <div className="text-gray-400 text-xs">
                            {beneficiary.totalAmount} {projectData.tokenSymbol} allocated
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-green-400 text-sm font-semibold">
                            {beneficiary.claimedAmount} claimed
                          </div>
                          <div className="text-gray-400 text-xs">
                            {beneficiary.progress}% progress
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          beneficiary.status === 'active' ? 'bg-green-400' : 
                          beneficiary.status === 'revoked' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No beneficiary data available</p>
                  <p className="text-sm">Connect your wallet to see your beneficiary status</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Beneficiaries Modal */}
      {showAddBeneficiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl border border-primary-500/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add Beneficiaries</h3>
              <button
                onClick={() => setShowAddBeneficiary(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {newBeneficiaries.map((beneficiary, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Wallet address (0x...)"
                    value={beneficiary.address}
                    onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={beneficiary.amount}
                    onChange={(e) => updateBeneficiary(index, 'amount', e.target.value)}
                    className="w-32 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                  />
                  {newBeneficiaries.length > 1 && (
                    <button
                      onClick={() => removeBeneficiaryRow(index)}
                      className="p-3 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={addNewBeneficiaryRow}
                className="px-4 py-2 text-primary-500 hover:text-primary-400 font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddBeneficiary(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBeneficiaries}
                  disabled={isAddingBeneficiaries}
                  className="px-6 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isAddingBeneficiaries ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Beneficiaries</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}