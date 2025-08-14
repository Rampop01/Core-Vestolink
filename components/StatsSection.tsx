"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Coins, Activity } from 'lucide-react'
import { useVestolinkFactory } from '@/lib/hooks/useContracts'
import { useReadContracts } from 'wagmi'
import { VESTOLINK_ABI } from '@/lib/web3'

export default function StatsSection() {
  const { allVestolinks } = useVestolinkFactory()
  // allVestolinks.data is an array of vestolink addresses
  const vestolinkAddresses = allVestolinks?.data || []
  const isLoading = allVestolinks.isLoading
  const isError = allVestolinks.isError

  // Use useReadContracts to fetch all beneficiary counts at once
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

  // Calculate total beneficiaries from contract data
  const totalBeneficiaries = useMemo(() => {
    if (isLoading || isError || beneficiaryCountsLoading || !beneficiaryCountsData) {
      return 0
    }
    
    return beneficiaryCountsData.reduce((sum, result) => {
      if (result.status === 'success' && result.result) {
        return sum + Number(result.result)
      }
      return sum
    }, 0)
  }, [beneficiaryCountsData, isLoading, isError, beneficiaryCountsLoading])

  // Placeholder for TVL and Tokens Vested
  const tvl = "-"
  const tokensVested = "-"

  if (isLoading) {
    return (
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto text-center text-lg text-gray-300">Loading stats...</div>
      </section>
    )
  }
  if (isError) {
    return (
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto text-center text-lg text-red-400">Failed to load stats from blockchain.</div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 bg-slate-800/50">
      <div className="max-w-7xl mx-auto">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-4">
            Debug: {vestolinkAddresses.length} contracts, {totalBeneficiaries} total beneficiaries
            {beneficiaryCountsData && (
              <div>Contract results: {JSON.stringify(beneficiaryCountsData.map(r => r.status === 'success' ? Number(r.result) : 'error'))}</div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 mb-2">{tvl}</div>
            <div className="text-gray-300 mb-1 text-sm sm:text-base">Total Value Locked</div>
            <div className="text-xs sm:text-sm text-green-400 flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>-</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 mb-2">{vestolinkAddresses.length}</div>
            <div className="text-gray-300 mb-1 text-sm sm:text-base">Projects Deployed</div>
            <div className="text-xs sm:text-sm text-green-400 flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>-</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 mb-2">{tokensVested}</div>
            <div className="text-gray-300 mb-1 text-sm sm:text-base">Tokens Vested</div>
            <div className="text-xs sm:text-sm text-green-400 flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>-</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 mb-2">{totalBeneficiaries}</div>
            <div className="text-gray-300 mb-1 text-sm sm:text-base">Active Beneficiaries</div>
            <div className="text-xs sm:text-sm text-green-400 flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>-</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
