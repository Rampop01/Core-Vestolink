"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ExternalLink, Wallet, AlertCircle, Zap, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount, useConnect } from 'wagmi'
import { isAddress } from 'viem'
import Link from "next/link"

export default function ClaimPage() {
  const router = useRouter()
  const { address: account, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [contractAddress, setContractAddress] = useState("")
  const [error, setError] = useState("")

  const handleSearch = () => {
    setError("")
    
    if (!contractAddress.trim()) {
      setError("Please enter a contract address")
      return
    }

    // Validate Ethereum address
    if (!isAddress(contractAddress)) {
      setError("Please enter a valid Ethereum address")
      return
    }

    // Navigate to specific claim page
    router.push(`/claim/${contractAddress}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 px-4 sm:px-6 py-4 border-b border-primary-500/20"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 sm:w-6 h-4 sm:h-6 text-slate-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-primary-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
              VestoLink
            </span>
          </Link>

          <Link
            href="/admin"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm"
          >
            <span>Admin Dashboard</span>
            <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
          </Link>
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Claim Your <span className="text-primary-500">Tokens</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Enter your vesting contract address to view and claim your tokens
            </p>
          </motion.div>
        </div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-blue-400 font-semibold">Connect Your Wallet</h3>
                  <p className="text-gray-300 text-sm">Connect your wallet to check your vesting status</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => connect({ connector: connectors[0] })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Enter Contract Address</h2>
            <p className="text-gray-400">
              Paste the vesting contract address you received from the project
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="contract-address" className="block text-sm font-medium text-gray-300 mb-2">
                Vesting Contract Address
              </label>
              <div className="relative">
                <input
                  id="contract-address"
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0x1234567890abcdef..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary-500 text-slate-900 rounded-lg hover:bg-primary-400 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="w-full py-3 bg-primary-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-primary-400 transition-colors flex items-center justify-center space-x-3 shadow-lg shadow-primary-500/25"
            >
              <Search className="w-5 h-5" />
              <span>Check Vesting Status</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-500 text-xl font-bold">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Get Contract Address</h4>
              <p className="text-gray-400 text-sm">
                Receive the vesting contract address from your project administrator
              </p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-500 text-xl font-bold">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Connect Wallet</h4>
              <p className="text-gray-400 text-sm">
                Connect your wallet to check if you're a beneficiary
              </p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-500 text-xl font-bold">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Claim Tokens</h4>
              <p className="text-gray-400 text-sm">
                View your vesting progress and claim available tokens
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-2xl"
        >
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-gray-300 text-sm">
              Bookmark your direct claim link for easy access: 
              <code className="ml-2 px-2 py-1 bg-slate-800 rounded text-primary-400 font-mono text-xs">
                /claim/[your-contract-address]
              </code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
