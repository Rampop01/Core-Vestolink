"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  Coins,
  Star,
  Globe,
  TrendingUp,
  Twitter,
  Github,
  MessageCircle,
  Settings,
  Rocket,
  Share,
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Secure Vesting",
    description: "Deploy secure token vesting contracts with built-in safety mechanisms and audit-ready code.",
  },
  {
    icon: Zap,
    title: "Gas Optimized",
    description: "Minimal proxy pattern ensures cost-effective deployment on Core Blockchain Testnet2.",
  },
  {
    icon: Users,
    title: "Batch Operations",
    description: "Upload thousands of beneficiaries at once with CSV import and batch processing.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track vesting progress, claim rates, and project performance with detailed analytics.",
  },
  {
    icon: Coins,
    title: "Multi-token Support",
    description: "Deploy new tokens or use existing ERC-20 tokens with flexible configuration options.",
  },
  {
    icon: Globe,
    title: "Core Blockchain Testnet2",
    description: "Deploy on the Core Blockchain Testnet2 with low fees and fast transactions.",
  },
]

import { useVestolinkFactory, useVestolink } from "../lib/hooks/useContracts"
import { useMemo } from "react"
import StatsSection from '../components/StatsSection'

// Remove static stats array. We'll use live contract data below.

const howItWorksSteps = [
  {
    step: "01",
    title: "Connect & Setup",
    description: "Connect your wallet and choose to create a new token or use an existing ERC-20 token for vesting.",
    icon: Zap,
  },
  {
    step: "02",
    title: "Configure Vesting",
    description:
      "Set up vesting parameters including cliff period, duration, release intervals, and early claim percentages.",
    icon: Settings,
  },
  {
    step: "03",
    title: "Add Beneficiaries",
    description: "Upload beneficiaries via CSV or add them manually with their wallet addresses and token allocations.",
    icon: Users,
  },
  {
    step: "04",
    title: "Deploy Contract",
    description: "Review your configuration and deploy the vesting contract to the Core Blockchain Testnet2.",
    icon: Rocket,
  },
  {
    step: "05",
    title: "Share Claim Links",
    description: "Generate branded claim pages for beneficiaries to easily claim their vested tokens.",
    icon: Share,
  },
  {
    step: "06",
    title: "Monitor & Manage",
    description: "Track vesting progress, manage beneficiaries, and analyze claim statistics in real-time.",
    icon: BarChart3,
  },
]

const testimonials = [
  {
    name: "Alex Chen",
    role: "CTO at DeFiProtocol",
    content: "VestoLink made our token distribution seamless. The gas optimization saved us thousands.",
    avatar: "🚀",
  },
  {
    name: "Sarah Johnson",
    role: "Founder at Web3Startup",
    content: "The branded claim pages look amazing. Our community loves the user experience.",
    avatar: "⭐",
  },
  {
    name: "Mike Rodriguez",
    role: "DAO Treasury Manager",
    content: "Best vesting platform we've used. Analytics and batch operations are game-changers.",
    avatar: "💎",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 sm:w-6 h-4 sm:h-6 text-slate-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-primary-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
              VestoLink
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-primary-500 transition-colors text-sm">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-primary-500 transition-colors text-sm">
              How it Works
            </Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-primary-500 transition-colors text-sm">
              Testimonials
            </Link>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/admin"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold hover:bg-primary-400 transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Decentralized Token
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                Vesting Platform
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Deploy secure, gas-optimized vesting contracts with branded claim pages on Core Blockchain Testnet2. Support for airdrops and batch
              operations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/admin"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-400 transition-all duration-200 flex items-center space-x-3 shadow-sm"
              >
                <span>Start Building</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/claim/demo"
                className="px-6 sm:px-8 py-3 sm:py-4 border border-primary-500 text-primary-500 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-500/10 transition-all duration-200 flex items-center space-x-3"
              >
                <span>View Demo</span>
                <Star className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Live Contract Data */}
      <StatsSection />


      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Deploy your token vesting in 6 simple steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary-500/30 transform sm:-translate-x-px"></div>

            <div className="space-y-8 sm:space-y-12">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 sm:left-1/2 w-4 h-4 bg-primary-500 rounded-full transform sm:-translate-x-1/2 border-4 border-slate-900"></div>

                  {/* Content */}
                  <div className={`ml-12 sm:ml-0 sm:w-1/2 ${index % 2 === 0 ? "sm:pr-12" : "sm:pl-12"}`}>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mr-4">
                          <step.icon className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <div className="text-primary-500 font-bold text-sm">STEP {step.step}</div>
                          <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to deploy and manage token vesting at scale
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                Trusted by Teams
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">See what builders are saying about VestoLink</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-slate-800/50 rounded-2xl border border-primary-500/20"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-300 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 bg-gradient-to-r from-primary-500/20 to-primary-300/20 rounded-2xl sm:rounded-3xl border border-primary-500/30"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Launch Your
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                Token Vesting?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
              Join thousands of projects using VestoLink for secure, efficient token distribution
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/admin"
                className="inline-flex items-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-slate-900 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-400 transition-all duration-200 shadow-sm"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-12 border-t border-primary-500/20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent">
                  VestoLink
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                The most advanced decentralized token vesting platform. Deploy secure, gas-optimized contracts with
                ease.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/claim/demo" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Security Audit
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Bug Reports
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-500/20 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2024 VestoLink. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
