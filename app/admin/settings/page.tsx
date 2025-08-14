"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  User,
  Palette,
  Globe,
  Shield,
  Bell,
  Key,
  Upload,
  Download,
  Save,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  Wallet,
  CheckCircle,
} from "lucide-react"
import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi'
import { useVestolinkFactory } from '@/lib/hooks/useContracts'
import { shortenAddress, formatTokenAmount } from '@/lib/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { address: account, isConnected } = useAccount()
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    claims: true,
    deployments: true,
    analytics: false,
  })
  const [brandSettings, setBrandSettings] = useState({
    logo: "",
    primaryColor: "#00FFD1",
    secondaryColor: "#0B0F1A",
    companyName: "VestoLink User",
    website: "https://vestolink.com",
    twitter: "@vestolink",
    discord: "https://discord.gg/vestolink",
  })

  // Get wallet and contract data
  const { data: balance } = useBalance({ address: account })
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { userVestolinks } = useVestolinkFactory()
  const vestolinkCount = userVestolinks?.data?.length || 0

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "wallet", name: "Wallet", icon: Wallet },
    { id: "networks", name: "Networks", icon: Globe },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "api", name: "API Keys", icon: Key },
  ]

  const networks = [
    { id: "core-testnet2", name: "Core Blockchain Testnet2", enabled: true, rpc: "https://rpc.test.btcs.network", gasPrice: "0.1 gwei", current: chainId === 1114 },
    { id: "base", name: "Base", enabled: false, rpc: "https://mainnet.base.org", gasPrice: "0.01 gwei", current: false },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and platform preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-500/20 text-primary-500"
                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-2xl border border-primary-500/20 p-6"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Profile Settings</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue={isConnected ? account : 'Not Connected'}
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="admin@yourcompany.com"
                      className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={account || "No wallet connected"}
                        readOnly
                        className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => account && copyToClipboard(account)}
                        disabled={!account}
                        className="p-3 bg-primary-500/20 text-primary-500 rounded-lg hover:bg-primary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time Zone</label>
                    <select className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none">
                      <option>UTC</option>
                      <option>EST</option>
                      <option>PST</option>
                      <option>GMT</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Wallet Settings</h2>

                {!isConnected ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h3>
                    <p className="text-gray-400 mb-6">Connect your wallet to view settings and manage your account</p>
                    <ConnectButton />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Wallet Info */}
                    <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-4">Connected Wallet</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={account || ''}
                              readOnly
                              className="flex-1 px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                            />
                            <button
                              onClick={() => copyToClipboard(account || '')}
                              className="p-3 bg-primary-500/20 text-primary-500 rounded-lg hover:bg-primary-500/30 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Balance</label>
                          <input
                            type="text"
                            value={balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                            readOnly
                            className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contract Stats */}
                    <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-4">Contract Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-500">{vestolinkCount}</div>
                          <div className="text-sm text-gray-400">Vesting Contracts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-500">{chainId === 1114 ? 'Core Blockchain Testnet2' : 'Unknown'}</div>
                          <div className="text-sm text-gray-400">Network</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            <CheckCircle className="w-6 h-6 mx-auto" />
                          </div>
                          <div className="text-sm text-gray-400">Connected</div>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Actions */}
                    <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-4">Wallet Actions</h3>
                      <div className="flex flex-wrap gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => disconnect()}
                          className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-colors flex items-center space-x-2 shadow-sm"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Disconnect Wallet</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(account || '')}
                          className="px-6 py-3 bg-primary-500/20 text-primary-500 rounded-lg font-semibold hover:bg-primary-500/30 transition-colors flex items-center space-x-2 shadow-sm"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy Address</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Networks Tab */}
            {activeTab === "networks" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Network Configuration</h2>

                <div className="space-y-4">
                  {networks.map((network) => (
                    <div key={network.id} className={`bg-slate-700/50 p-6 rounded-xl border ${
                      network.current ? 'border-primary-500/50 bg-primary-500/5' : 'border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            network.current ? 'bg-primary-500' : network.enabled ? "bg-green-400" : "bg-gray-400"
                          }`} />
                          <h3 className="text-lg font-semibold text-white">{network.name}</h3>
                          {network.current && (
                            <span className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={network.enabled}
                            className="sr-only peer"
                            onChange={() => {}}
                            disabled={network.current}
                          />
                          <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            network.current ? 'peer-checked:bg-primary-500' : 'peer-checked:bg-green-500'
                          }`}></div>
                        </label>
                      </div>



                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">RPC URL</label>
                          <input
                            type="url"
                            value={network.rpc}
                            className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price</label>
                          <input
                            type="text"
                            value={network.gasPrice}
                            className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Network</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Network Settings</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Security Settings</h2>

                <div className="space-y-6">
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 mb-1">Secure your account with 2FA</p>
                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors text-sm shadow-sm">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-gray-600">
                        <div>
                          <p className="text-white">Current Session</p>
                          <p className="text-sm text-gray-400">Chrome on MacOS • Active now</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Current</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white">Mobile App</p>
                          <p className="text-sm text-gray-400">iOS • Last active 2 hours ago</p>
                        </div>
                        <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Backup & Recovery</h3>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5 text-primary-500" />
                          <div className="text-left">
                            <p className="text-white font-medium">Download Backup</p>
                            <p className="text-sm text-gray-400">Export your account data</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-4 border-b border-gray-600">
                      <div>
                        <p className="text-white font-medium capitalize">
                          {key === "email"
                            ? "Email Notifications"
                            : key === "push"
                              ? "Push Notifications"
                              : key === "claims"
                                ? "Token Claims"
                                : key === "deployments"
                                  ? "Contract Deployments"
                                  : "Analytics Reports"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {key === "email"
                            ? "Receive notifications via email"
                            : key === "push"
                              ? "Browser push notifications"
                              : key === "claims"
                                ? "Notify when tokens are claimed"
                                : key === "deployments"
                                  ? "Notify when contracts are deployed"
                                  : "Weekly analytics summaries"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">API Keys</h2>

                <div className="space-y-4">
                  <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Production API Key</h3>
                        <p className="text-sm text-gray-400">Use this key for production deployments</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard("vl_prod_1234567890abcdef")}
                          className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-sm bg-slate-800 p-3 rounded-lg border border-gray-600">
                      {showApiKey
                        ? "vl_prod_1234567890abcdef1234567890abcdef"
                        : "vl_prod_••••••••••••••••••••••••••••••••"}
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-6 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Development API Key</h3>
                        <p className="text-sm text-gray-400">Use this key for testing and development</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-slate-700 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-sm bg-slate-800 p-3 rounded-lg border border-gray-600">
                      vl_dev_••••••••••••••••••••••••••••••••
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate New Key</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Documentation</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
