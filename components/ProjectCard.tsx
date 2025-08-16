"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useVestolink, useToken } from '@/lib/hooks/useContracts'
import { shortenAddress } from "@/lib/web3"

interface ProjectCardProps {
  address: string
  index: number
  isRecent?: boolean
}

export default function ProjectCard({ address, index, isRecent = false }: ProjectCardProps) {
  // Get data from vestolink contract
  const { tokenAddress, beneficiaryCount } = useVestolink(address as `0x${string}`)
  
  // Get token data once we have the token address
  const tokenData = useToken(tokenAddress?.data as `0x${string}` || '0x0000000000000000000000000000000000000000')

  // Memoize project data to prevent unnecessary re-renders
  const projectData = useMemo(() => {
    const tokenName = tokenData?.name?.data as string
    const tokenSymbol = tokenData?.symbol?.data as string
    
    return {
      tokenName: tokenName || `Vesting Contract ${shortenAddress(address)}`,
      tokenSymbol: tokenSymbol || 'TKN',
      tokenAddress: tokenAddress?.data as string || '0x0000000000000000000000000000000000000000',
      beneficiaryCount: Number(beneficiaryCount?.data || 0),
      status: 'active' as const,
    }
  }, [tokenData?.name?.data, tokenData?.symbol?.data, tokenAddress?.data, beneficiaryCount?.data, address])

  return (
    <div className={`p-4 bg-slate-900/50 rounded-xl border transition-all duration-200 ${
      isRecent 
        ? 'border-primary-500/50 bg-primary-500/5 ring-1 ring-primary-500/20' 
        : 'border-primary-500/10 hover:border-primary-500/30'
    }`}>
      {isRecent && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-primary-400 font-medium">Recently Deployed</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-300 rounded-lg flex items-center justify-center text-slate-900 font-bold">
            {projectData.tokenSymbol.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-white">{projectData.tokenName}</div>
            <div className="text-sm text-gray-400">{projectData.tokenSymbol}</div>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            projectData.status === "active"
              ? "bg-green-500/20 text-green-400"
              : projectData.status === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {projectData.status}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Beneficiaries</div>
          <div className="text-sm font-medium text-white">{projectData.beneficiaryCount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Contract</div>
          <div className="text-sm font-medium text-white font-mono">{shortenAddress(address)}</div>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs text-gray-400 mb-1">Token</div>
          <div className="text-sm font-medium text-white font-mono">
            {shortenAddress(projectData.tokenAddress)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">Contract: {shortenAddress(address)}</div>
        <Link
          href={`/admin/projects/${address}`}
          className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center space-x-1"
        >
          <span>Manage</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
