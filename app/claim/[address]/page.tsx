"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, CheckCircle, Coins, TrendingUp, Download, ExternalLink, Copy, Award, Wallet } from "lucide-react"
import { useAccount, useConnect } from 'wagmi'
import { useVestolink, useToken } from '@/lib/hooks/useContracts'
import { formatTokenAmount, shortenAddress } from "@/lib/utils"
import { getExplorerUrl, VESTOLINK_ABI } from '@/lib/web3'

interface VestingData {
  totalAmount: string
  claimedAmount: string
  templateId: string
  airdropClaimed: boolean
  revoked: boolean
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

interface TokenInfo {
  name: string
  symbol: string
  address: string
}

export default function ClaimPage({ params }: { params: { address: string } }) {
  const { address: account } = useAccount()
  const { connect, connectors } = useConnect()
  const vestolinkAddress = params.address as `0x${string}`
  
  // Use enhanced contract hooks for real data
  const { 
    vestingSchedule, 
    claimableAmount: claimableAmountData, 
    claimTokens,
    tokenAddress,
    vestingTemplate: vestingTemplateData
  } = useVestolink(vestolinkAddress)
  
  // Get token information
  const tokenData = useToken(tokenAddress?.data as `0x${string}` || '0x0000000000000000000000000000000000000000')
  
  const [vestingData, setVestingData] = useState<VestingData | null>(null)
  const [vestingTemplate, setVestingTemplate] = useState<VestingTemplate | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [claimableAmount, setClaimableAmount] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load vesting data
  useEffect(() => {
    const loadVestingData = async () => {
      if (!account) {
        setLoading(false)
        return
      }

      try {
        // Get token info from token contract
        if (tokenData?.name?.data && tokenData?.symbol?.data && tokenAddress?.data) {
          setTokenInfo({
            name: tokenData.name.data as string,
            symbol: tokenData.symbol.data as string,
            address: tokenAddress.data as string,
          })
        } else {
          // Default fallback
          setTokenInfo({
            name: `Token for ${vestolinkAddress.slice(0, 6)}`,
            symbol: 'VTK',
            address: '0x0000000000000000000000000000000000000000',
          })
        }

        // Get beneficiary vesting schedule data from getVestingSchedule
        if (vestingSchedule?.data) {
          const scheduleResult = vestingSchedule.data as any
          console.log('Raw vesting schedule data:', scheduleResult)
          
          // Extract beneficiary data and template from getVestingSchedule result
          const beneficiaryData = scheduleResult.data || scheduleResult[0]
          const templateData = scheduleResult.template || scheduleResult[1]
          
          if (beneficiaryData) {
            setVestingData({
              totalAmount: beneficiaryData.totalAmount?.toString() || '0',
              claimedAmount: beneficiaryData.claimedAmount?.toString() || '0',
              templateId: beneficiaryData.templateId?.toString() || '0',
              airdropClaimed: Boolean(beneficiaryData.airdropClaimed),
              revoked: Boolean(beneficiaryData.revoked),
            })
          } else {
            // No vesting data found - user is not a beneficiary
            setVestingData({
              totalAmount: '0',
              claimedAmount: '0',
              templateId: '0',
              airdropClaimed: false,
              revoked: false,
            })
          }

          // Set vesting template from getVestingSchedule
          if (templateData) {
            setVestingTemplate({
              startTime: Number(templateData.startTime || 0),
              cliffDuration: Number(templateData.cliffDuration || 0),
              totalDuration: Number(templateData.totalDuration || 0),
              releaseInterval: Number(templateData.releaseInterval || 0),
              earlyClaimPercentage: Number(templateData.earlyClaimPercentage || 0),
              earlyClaimEnabled: Boolean(templateData.earlyClaimEnabled),
              isActive: Boolean(templateData.isActive),
            })
          }
        } else if (vestingTemplateData?.data) {
          // Fallback to separate template data if available
          const template = vestingTemplateData.data as any
          setVestingTemplate({
            startTime: Number(template.startTime || 0),
            cliffDuration: Number(template.cliffDuration || 0),
            totalDuration: Number(template.totalDuration || 0),
            releaseInterval: Number(template.releaseInterval || 0),
            earlyClaimPercentage: Number(template.earlyClaimPercentage || 0),
            earlyClaimEnabled: Boolean(template.earlyClaimEnabled),
            isActive: Boolean(template.isActive),
          })
          
          // No vesting data found - user is not a beneficiary
          setVestingData({
            totalAmount: '0',
            claimedAmount: '0',
            templateId: '0',
            airdropClaimed: false,
            revoked: false,
          })
        } else {
          // Fallback template data
          setVestingTemplate({
            startTime: Math.floor(Date.now() / 1000),
            cliffDuration: 31536000, // 1 year
            totalDuration: 63072000, // 2 years
            releaseInterval: 31536000, // 1 year
            earlyClaimPercentage: 0,
            earlyClaimEnabled: false,
            isActive: true,
          })
          
          // No vesting data found - user is not a beneficiary
          setVestingData({
            totalAmount: '0',
            claimedAmount: '0',
            templateId: '0',
            airdropClaimed: false,
            revoked: false,
          })
        }

        // Use real claimable amount if available
        if (claimableAmountData?.data) {
          const amount = claimableAmountData.data.toString()
          // Convert from wei to readable format (assuming 18 decimals)
          const formattedAmount = (Number(amount) / 1e18).toString()
          setClaimableAmount(formattedAmount)
        } else {
          setClaimableAmount('0')
        }
      } catch (error) {
        console.error("Error loading vesting data:", error)
        // Set fallback data
        setVestingData({
          totalAmount: '0',
          claimedAmount: '0',
          templateId: '0',
          airdropClaimed: false,
          revoked: false,
        })
        setVestingTemplate({
          startTime: Math.floor(Date.now() / 1000),
          cliffDuration: 0,
          totalDuration: 0,
          releaseInterval: 0,
          earlyClaimPercentage: 0,
          earlyClaimEnabled: false,
          isActive: false,
        })
        setTokenInfo({
          name: 'Unknown Token',
          symbol: 'UNK',
          address: '0x0000000000000000000000000000000000000000',
        })
      } finally {
        setLoading(false)
      }
    }

    loadVestingData()
  }, [account, vestolinkAddress, vestingSchedule?.data, claimableAmountData?.data, tokenData?.name?.data, tokenData?.symbol?.data, tokenAddress?.data, vestingTemplateData?.data])

  // Update countdown timer
  useEffect(() => {
    if (!vestingTemplate) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const nextUnlock = vestingTemplate.startTime + vestingTemplate.cliffDuration

      if (now < nextUnlock) {
        const diff = nextUnlock - now
        const days = Math.floor(diff / (24 * 60 * 60))
        const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
        const minutes = Math.floor((diff % (60 * 60)) / 60)
        const seconds = diff % 60

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft(null)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [vestingTemplate])

  const connectWallet = async () => {
    if (connectors.length > 0) {
      await connect({ connector: connectors[0] })
    }
  }

  const handleClaim = async () => {
    if (!account) {
      await connectWallet()
      return
    }

    setClaiming(true)
    try {
      await claimTokens.writeContractAsync({
        address: vestolinkAddress,
        abi: VESTOLINK_ABI,
        functionName: 'claimTokens',
      })

      // Refresh data after successful claim
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error("Claim error:", error)
      alert(`Claim failed: ${error.message}`)
    } finally {
      setClaiming(false)
    }
  }

  const handleEarlyClaim = async () => {
    if (!account) {
      await connectWallet()
      return
    }

    setClaiming(true)
    try {
      await claimTokens.writeContractAsync({
        address: vestolinkAddress,
        abi: VESTOLINK_ABI,
        functionName: 'claimEarlyClaim', // Use the specific early claim function
      })

      // Refresh data after successful claim
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error("Early claim error:", error)
      alert(`Early claim failed: ${error.message}`)
    } finally {
      setClaiming(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const progressPercentage = vestingData && Number.parseFloat(vestingData.totalAmount) > 0
    ? ((Number.parseFloat(vestingData.claimedAmount) / 1e18) / (Number.parseFloat(vestingData.totalAmount) / 1e18)) * 100
    : 0

  // Helper function to format token amounts from wei
  const formatDisplayAmount = (weiAmount: string) => {
    const amount = Number.parseFloat(weiAmount) / 1e18
    return amount.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 6 
    })
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to view and claim your vested tokens.</p>
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
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading vesting data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!vestingData || !vestingTemplate || !tokenInfo) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Vesting Found</h2>
            <p className="text-gray-400">No vesting allocation found for your address in this contract.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-primary-500/20 bg-slate-800/50 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-300 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                {tokenInfo?.symbol?.charAt(0) || 'T'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{tokenInfo?.name || 'Token'}</h1>
                <p className="text-gray-400">{tokenInfo?.symbol || 'TKN'} Token Vesting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(vestolinkAddress)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                <span className="font-mono">{shortenAddress(vestolinkAddress)}</span>
                <Copy className="w-4 h-4" />
              </motion.button>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-primary-500 text-sm"
                >
                  Copied!
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Claim Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 bg-gradient-to-br from-primary-500/20 to-primary-300/20 rounded-3xl border border-primary-500/30"
            >
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-3xl sm:text-5xl font-bold text-primary-500 mb-2">
                  {Number.parseFloat(claimableAmount).toLocaleString(undefined, { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 6 
                  })}
                </div>
                <div className="text-lg sm:text-xl text-gray-300 mb-4">{tokenInfo.symbol} Available to Claim</div>
              </div>

              <div className="space-y-4">
                {Number.parseFloat(claimableAmount) > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full py-3 sm:py-4 bg-primary-500 text-slate-900 rounded-2xl font-bold text-base sm:text-lg hover:bg-primary-400 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg shadow-primary-500/25 disabled:opacity-50"
                  >
                    {claiming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 sm:w-6 h-5 sm:h-6" />
                        <span>Claim Tokens</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  // Check if user is a beneficiary (has total amount > 0) or not a beneficiary at all
                  vestingData && Number.parseFloat(vestingData.totalAmount) > 0 ? (
                    // User IS a beneficiary but tokens aren't claimable yet
                    <div className="w-full py-4 sm:py-6 bg-slate-800/50 rounded-2xl border border-yellow-500/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">Tokens Not Yet Claimable</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Your tokens are still vesting. You'll be able to claim when the vesting schedule allows.
                      </p>
                      {timeLeft ? (
                        <p className="text-white text-sm">
                          <span className="text-gray-400">Next unlock in:</span>{" "}
                          <span className="font-bold text-primary-400">
                            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                          </span>
                        </p>
                      ) : (
                        <p className="text-white text-sm">
                          <span className="text-gray-400">Status:</span>{" "}
                          <span className="font-bold text-green-400">Fully Unlocked</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    // User is NOT a beneficiary of this contract
                    <div className="w-full py-4 sm:py-6 bg-red-900/20 rounded-2xl border border-red-500/30 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <ExternalLink className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-semibold">Not a Beneficiary</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Your wallet address is not a beneficiary of this vesting contract.
                      </p>
                      <p className="text-gray-400 text-xs">
                        Please check if you have the correct wallet connected or contact the project administrator.
                      </p>
                    </div>
                  )
                )}

                {vestingTemplate.earlyClaimEnabled && !vestingData.airdropClaimed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEarlyClaim}
                    disabled={claiming}
                    className="w-full py-3 sm:py-4 bg-blue-500 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-400 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {claiming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Claiming...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-5 sm:w-6 h-5 sm:h-6" />
                        <span>Claim Early ({vestingTemplate.earlyClaimPercentage}%)</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Vesting Progress</span>
                  <span className="text-white">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-primary-500 to-primary-300 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Start: {new Date(Number(vestingTemplate.startTime) * 1000).toLocaleDateString()}</span>
                  <span>
                    End:{" "}
                    {new Date((Number(vestingTemplate.startTime) + Number(vestingTemplate.totalDuration)) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Allocated</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {formatDisplayAmount(vestingData.totalAmount)}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Already Claimed</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {formatDisplayAmount(vestingData.claimedAmount)}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Available Now</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {Number.parseFloat(claimableAmount).toLocaleString(undefined, { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6 
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Unlock Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
            >
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-primary-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Next Unlock</h3>
                <div className="text-lg sm:text-2xl font-bold text-primary-500 mb-2">
                  {timeLeft 
                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    : "Unlocked"
                  }
                </div>
              </div>
            </motion.div>

            {/* Contract Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Contract Info</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Token Contract</div>
                  <div className="text-sm text-white font-mono flex items-center justify-between">
                    <span>{shortenAddress(tokenInfo.address)}</span>
                    <a
                      href={getExplorerUrl(tokenInfo.address, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Vesting Contract</div>
                  <div className="text-sm text-white font-mono flex items-center justify-between">
                    <span>{shortenAddress(vestolinkAddress)}</span>
                    <a
                      href={getExplorerUrl(vestolinkAddress, "address")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vesting Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Vesting Schedule</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cliff Period:</span>
                  <span className="text-white">{Math.floor(Number(vestingTemplate.cliffDuration) / (24 * 60 * 60))} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Duration:</span>
                  <span className="text-white">{Math.floor(Number(vestingTemplate.totalDuration) / (24 * 60 * 60))} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Release Interval:</span>
                  <span className="text-white">
                    {Math.floor(Number(vestingTemplate.releaseInterval) / (24 * 60 * 60))} days
                  </span>
                </div>
                {vestingTemplate.earlyClaimEnabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Early Claim:</span>
                    <span className="text-white">{vestingTemplate.earlyClaimPercentage}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
