"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { shortenAddress } from '@/lib/utils'
import { Home, Rocket, Settings, BarChart3, Users, Menu, X, Zap, Shield, Coins, FileText, Bell } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { address: connectedAddress, isConnected } = useAccount()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Deploy Project", href: "/admin/deploy", icon: Rocket },
    { name: "My Projects", href: "/admin/projects", icon: Coins },
    { name: "Beneficiaries", href: "/admin/beneficiaries", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Templates", href: "/admin/templates", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const isAdminRoute = pathname?.startsWith("/admin")

  if (!isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-6 pb-4 border-r border-primary-500/20">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                VestoLink
              </span>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-primary-500/20 text-primary-500"
                              : "text-gray-400 hover:text-white hover:bg-slate-700"
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                          {isActive && (
                            <motion.div layoutId="activeTab" className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t border-primary-500/20 pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-white rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-300 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-900" />
              </div>
              <span className="sr-only">Your profile</span>
              <div className="flex-1">
                <span aria-hidden="true">{isConnected ? 'Connected User' : 'Admin User'}</span>
                <p className="text-xs text-gray-400">
                  {isConnected && connectedAddress ? shortenAddress(connectedAddress) : 'Not Connected'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className="relative z-50 lg:hidden">
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 px-6 pb-4 border-r border-primary-500/20">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-slate-900" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                    VestoLink
                  </span>
                </motion.div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col mt-5">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 ${
                                isActive
                                  ? "bg-primary-500/20 text-primary-500"
                                  : "text-gray-400 hover:text-white hover:bg-slate-700"
                              }`}
                            >
                              <item.icon className="h-6 w-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-primary-500/20 bg-slate-900/80 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-600" />

              <div className="flex items-center space-x-4">
                <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
