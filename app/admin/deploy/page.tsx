"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Plus,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  ExternalLink,
  Loader2,
  Copy,
} from "lucide-react"
import Link from "next/link"
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseTokenAmount, getExplorerUrl, shortenAddress, VESTOLINK_ABI, FACTORY_ABI, CONTRACTS } from "@/lib/web3"

const steps = [
  { id: 1, name: "Network & Token", description: "Choose network and token setup" },
  { id: 2, name: "Vesting Config", description: "Configure vesting parameters" },
  { id: 3, name: "Beneficiaries", description: "Add beneficiaries and allocations" },
  { id: 4, name: "Review & Deploy", description: "Review and deploy contract" },
]

const networks = [
  {
    id: "core-testnet2",
    name: "Core Blockchain Testnet2",
    chainId: 1114,
    gasPrice: "0.1 gwei",
    deploymentCost: "~$0.001-0.01",
    icon: "⚡",
    color: "from-orange-500 to-orange-300",
  },
]

export default function DeployProject() {
  const { address: account, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  
  // Contract hooks
  const { writeContract: deployWithTokenWrite, data: deployTokenTxHash, isPending: isDeployTokenPending, error: deployTokenError } = useWriteContract()
  const { writeContract: deployWithExistingTokenWrite, data: deployExistingTxHash, isPending: isDeployExistingPending, error: deployExistingError } = useWriteContract()
  const { writeContract: writeVestingSchedule, data: vestingTxHash, isPending: isVestingPending, error: vestingError } = useWriteContract()
  
  // Wait for transaction receipts
  const { data: deployTokenReceipt, isSuccess: isDeployTokenSuccess } = useWaitForTransactionReceipt({
    hash: deployTokenTxHash,
  })
  const { data: deployExistingReceipt, isSuccess: isDeployExistingSuccess } = useWaitForTransactionReceipt({
    hash: deployExistingTxHash,
  })
  
  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNetwork, setSelectedNetwork] = useState<string>("core-testnet2")
  const [tokenType, setTokenType] = useState<"new" | "existing" | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "success" | "error">("idle")
  const [deploymentResult, setDeploymentResult] = useState<{
    vestolinkAddress: string
    tokenAddress: string
    txHash: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [deploymentSteps, setDeploymentSteps] = useState([
    { name: "Validating parameters", status: "pending" },
    { name: "Deploying contracts", status: "pending" },
    { name: "Setting up vesting schedule", status: "pending" },
    { name: "Finalizing deployment", status: "pending" },
  ])

  const [formData, setFormData] = useState({
    // Token data
    tokenName: "",
    tokenSymbol: "",
    totalSupply: "",
    existingTokenAddress: "",

    // Vesting config
    startTime: "",
    cliffDuration: "",
    totalDuration: "",
    releaseInterval: "",
    earlyClaimPercent: "",

    // Beneficiaries
    beneficiaries: [] as Array<{ address: string; amount: string }>,
  })

  // Handle successful deployment when transaction receipts are available
  useEffect(() => {
    if (isDeployTokenSuccess && deployTokenReceipt && deploymentStatus === "deploying") {
      processSuccessfulDeployment(deployTokenReceipt, deployTokenTxHash!, "new")
    }
  }, [isDeployTokenSuccess, deployTokenReceipt, deploymentStatus, deployTokenTxHash])

  useEffect(() => {
    if (isDeployExistingSuccess && deployExistingReceipt && deploymentStatus === "deploying") {
      processSuccessfulDeployment(deployExistingReceipt, deployExistingTxHash!, "existing")
    }
  }, [isDeployExistingSuccess, deployExistingReceipt, deploymentStatus, deployExistingTxHash])

  // Handle deployment errors
  useEffect(() => {
    if (deployTokenError && deploymentStatus === "deploying") {
      console.error("Deploy token error:", deployTokenError)
      setDeploymentStatus("error")
      setIsDeploying(false)
    }
  }, [deployTokenError, deploymentStatus])

  useEffect(() => {
    if (deployExistingError && deploymentStatus === "deploying") {
      console.error("Deploy existing token error:", deployExistingError)
      setDeploymentStatus("error")
      setIsDeploying(false)
    }
  }, [deployExistingError, deploymentStatus])

  const processSuccessfulDeployment = async (receipt: any, txHash: string, type: "new" | "existing") => {
    try {
      let vestolinkAddress: string = ''
      let tokenAddress: string = ''

      // Parse the transaction receipt for actual contract addresses
      if (receipt.logs && receipt.logs.length > 0) {
        // Look for VestolinkDeployed event in logs
        const vestolinkDeployedEvent = receipt.logs.find((log: any) => 
          log.topics && log.topics.length >= 3 && 
          log.address?.toLowerCase() === CONTRACTS.FACTORY.toLowerCase()
        )
        
        if (vestolinkDeployedEvent) {
          if (vestolinkDeployedEvent.topics[2]) {
            vestolinkAddress = `0x${vestolinkDeployedEvent.topics[2].slice(26)}`
          }
          
          if (type === "new" && vestolinkDeployedEvent.topics[3]) {
            tokenAddress = `0x${vestolinkDeployedEvent.topics[3].slice(26)}`
          } else if (type === "existing") {
            tokenAddress = formData.existingTokenAddress
          }
        } else {
          throw new Error('VestolinkDeployed event not found in transaction receipt')
        }
      } else {
        throw new Error('Transaction receipt has no logs')
      }

      // Validate addresses
      if (!vestolinkAddress || vestolinkAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Failed to extract valid Vestolink contract address')
      }
      
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Failed to get valid token address')
      }

      setDeploymentSteps((prev) =>
        prev.map((step, i) =>
          i === 1 ? { ...step, status: "completed" } : i === 2 ? { ...step, status: "active" } : step,
        ),
      )

      // Step 3: Set up vesting schedule if beneficiaries exist
      const validBeneficiaries = formData.beneficiaries.filter(b => b.address && b.amount && b.amount.trim() !== '')
      if (validBeneficiaries.length > 0) {
        const beneficiaryAddresses = validBeneficiaries.map((b) => b.address as `0x${string}`)
        const amounts = validBeneficiaries.map((b) => parseTokenAmount(b.amount))
        const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000)
        const cliffDuration = Number.parseInt(formData.cliffDuration) * 24 * 60 * 60
        const totalDuration = Number.parseInt(formData.totalDuration) * 24 * 60 * 60
        const releaseInterval = Number.parseInt(formData.releaseInterval) * 24 * 60 * 60
        const earlyClaimPercentage = Number.parseInt(formData.earlyClaimPercent) || 0
        const earlyClaimEnabled = earlyClaimPercentage > 0

        try {
          await writeVestingSchedule({
            address: vestolinkAddress as `0x${string}`,
            abi: VESTOLINK_ABI,
            functionName: 'createVestingSchedule',
            args: [
              beneficiaryAddresses,
              amounts,
              BigInt(startTime),
              BigInt(cliffDuration),
              BigInt(totalDuration),
              BigInt(releaseInterval),
              BigInt(earlyClaimPercentage),
              earlyClaimEnabled,
            ],
          })

          setDeploymentSteps((prev) =>
            prev.map((step, i) =>
              i === 2 ? { ...step, status: "completed" } : i === 3 ? { ...step, status: "active" } : step,
            ),
          )
        } catch (error) {
          console.error('Failed to create vesting schedule:', error)
          // Continue anyway - the contract is deployed, vesting can be set up later
        }
      }

      // Step 4: Finalize
      setDeploymentSteps((prev) =>
        prev.map((step, i) => (i === 3 ? { ...step, status: "completed" } : step)),
      )

      setDeploymentResult({
        vestolinkAddress,
        tokenAddress,
        txHash,
      })
      setDeploymentStatus("success")

    } catch (error: any) {
      console.error("Deployment processing error:", error)
      setDeploymentStatus("error")
    } finally {
      setIsDeploying(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addBeneficiary = () => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { address: "", amount: "" }],
    }))
  }

  const updateBeneficiary = (index: number, field: string, value: string) => {
    // For amount field, ensure it's a valid number
    if (field === "amount" && value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
      return // Don't update if invalid number
    }
    
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    }))
  }

  const removeBeneficiary = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }))
  }

  const deployContract = async () => {
    if (!account) {
      return
    }

    if (isDeployTokenPending || isDeployExistingPending) {
      return
    }

    // Clean up empty beneficiaries before deployment
    const cleanedBeneficiaries = formData.beneficiaries.filter(b => 
      b.address && b.address.trim() !== '' && b.amount && b.amount.trim() !== ''
    )
    
    setFormData(prev => ({ ...prev, beneficiaries: cleanedBeneficiaries }))

    setIsDeploying(true)
    setDeploymentStatus("deploying")

    try {
      // Step 1: Validate parameters
      setDeploymentSteps((prev) => prev.map((step, i) => (i === 0 ? { ...step, status: "active" } : step)))

      // Validate form data
      if (tokenType === "new") {
        if (!formData.tokenName || !formData.tokenSymbol || !formData.totalSupply) {
          throw new Error("Please fill in all token information")
        }
      } else if (tokenType === "existing") {
        if (!formData.existingTokenAddress) {
          throw new Error("Please provide an existing token address")
        }
      }

      // Validate beneficiaries if any are added
      if (cleanedBeneficiaries.length > 0) {
        const invalidBeneficiaries = cleanedBeneficiaries.some(b => 
          !b.address || !b.amount || b.amount.trim() === '' || isNaN(Number(b.amount)) || Number(b.amount) <= 0
        )
        if (invalidBeneficiaries) {
          throw new Error("Please provide valid addresses and amounts for all beneficiaries")
        }
      }

      setDeploymentSteps((prev) =>
        prev.map((step, i) =>
          i === 0 ? { ...step, status: "completed" } : i === 1 ? { ...step, status: "active" } : step,
        ),
      )

      // Step 2: Deploy contracts
      if (tokenType === "new") {
        await deployWithTokenWrite({
          address: CONTRACTS.FACTORY,
          abi: FACTORY_ABI,
          functionName: 'deployVestolinkWithToken',
          args: [
            formData.tokenName,
            formData.tokenSymbol,
            parseTokenAmount(formData.totalSupply)
          ],
        })
      } else {
        await deployWithExistingTokenWrite({
          address: CONTRACTS.FACTORY,
          abi: FACTORY_ABI,
          functionName: 'deployVestolinkWithExistingToken',
          args: [formData.existingTokenAddress as `0x${string}`],
        })
      }

    } catch (error: any) {
      console.error("Deployment error:", error)
      setDeploymentStatus("error")
      setIsDeploying(false)
    }
  }

  const copyToClipboard = () => {
    if (deploymentResult) {
      const claimUrl = `${window.location.origin}/claim/${deploymentResult.vestolinkAddress}`
      navigator.clipboard.writeText(claimUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to deploy a new vesting contract.</p>
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

  if (deploymentStatus === "success" && deploymentResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Deployment Successful!</h2>
          <p className="text-gray-400 mb-8">Your vesting contract has been deployed successfully.</p>

          <div className="bg-slate-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Contract Details</h3>
            <div className="space-y-4 text-left">
              <div>
                <span className="text-gray-400">Vestolink Contract:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white font-mono">{shortenAddress(deploymentResult.vestolinkAddress)}</span>
                  <a
                    href={getExplorerUrl(deploymentResult.vestolinkAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Token Contract:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white font-mono">{shortenAddress(deploymentResult.tokenAddress)}</span>
                  <a
                    href={getExplorerUrl(deploymentResult.tokenAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Transaction:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white font-mono">{shortenAddress(deploymentResult.txHash)}</span>
                  <a
                    href={getExplorerUrl(deploymentResult.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Claim URL</h3>
            <p className="text-gray-400 mb-4">Share this URL with beneficiaries so they can claim their tokens:</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-slate-700 rounded-lg p-3 text-white font-mono text-sm break-all">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/claim/${deploymentResult.vestolinkAddress}`}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-primary-500 text-slate-900 rounded-lg font-semibold hover:bg-primary-400 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/admin"
              className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href={`/admin/projects/${deploymentResult.vestolinkAddress}`}
              className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors"
            >
              Manage Project
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (deploymentStatus === "error") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Deployment Failed</h2>
          <p className="text-gray-400 mb-8">There was an error deploying your vesting contract. Please try again.</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setDeploymentStatus("idle")
                setIsDeploying(false)
                setCurrentStep(1)
              }}
              className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isDeploying) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Deploying Contract</h2>
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-800 rounded-lg p-4">
                <span className="text-white">{step.name}</span>
                {step.status === "completed" && <CheckCircle className="w-6 h-6 text-green-500" />}
                {step.status === "active" && <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />}
                {step.status === "pending" && <Clock className="w-6 h-6 text-gray-500" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-primary-400 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Deploy Vesting Contract</h1>
        <p className="text-gray-400">Create a new token vesting contract with customizable parameters.</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.id
                    ? "bg-primary-500 text-slate-900"
                    : "bg-slate-700 text-gray-400"
                }`}
              >
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 sm:w-24 h-px bg-slate-700 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-800 rounded-xl p-6 mb-8"
        >
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Network & Token Setup</h3>
              
              {/* Network Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Network</label>
                <div className="grid gap-4">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      onClick={() => setSelectedNetwork(network.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedNetwork === network.id
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{network.icon}</span>
                          <div>
                            <h4 className="text-white font-medium">{network.name}</h4>
                            <p className="text-gray-400 text-sm">Chain ID: {network.chainId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Gas: {network.gasPrice}</p>
                          <p className="text-gray-400 text-sm">{network.deploymentCost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Token Setup</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setTokenType("new")}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      tokenType === "new"
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Coins className="w-5 h-5 text-primary-400 mr-2" />
                      <h4 className="text-white font-medium">Create New Token</h4>
                    </div>
                    <p className="text-gray-400 text-sm">Deploy a new ERC-20 token with your vesting contract</p>
                  </div>
                  <div
                    onClick={() => setTokenType("existing")}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      tokenType === "existing"
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Upload className="w-5 h-5 text-primary-400 mr-2" />
                      <h4 className="text-white font-medium">Use Existing Token</h4>
                    </div>
                    <p className="text-gray-400 text-sm">Connect to an existing ERC-20 token contract</p>
                  </div>
                </div>
              </div>

              {/* Token Configuration */}
              {tokenType === "new" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                    <input
                      type="text"
                      value={formData.tokenName}
                      onChange={(e) => handleInputChange("tokenName", e.target.value)}
                      placeholder="e.g., My Company Token"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => handleInputChange("tokenSymbol", e.target.value)}
                      placeholder="e.g., MCT"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Total Supply</label>
                    <input
                      type="number"
                      value={formData.totalSupply}
                      onChange={(e) => handleInputChange("totalSupply", e.target.value)}
                      placeholder="e.g., 1000000"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {tokenType === "existing" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token Contract Address</label>
                  <input
                    type="text"
                    value={formData.existingTokenAddress}
                    onChange={(e) => handleInputChange("existingTokenAddress", e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Vesting Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cliff Duration (days)</label>
                  <input
                    type="number"
                    value={formData.cliffDuration}
                    onChange={(e) => handleInputChange("cliffDuration", e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Duration (days)</label>
                  <input
                    type="number"
                    value={formData.totalDuration}
                    onChange={(e) => handleInputChange("totalDuration", e.target.value)}
                    placeholder="365"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Release Interval (days)</label>
                  <input
                    type="number"
                    value={formData.releaseInterval}
                    onChange={(e) => handleInputChange("releaseInterval", e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Early Claim Percentage (optional)</label>
                  <input
                    type="number"
                    value={formData.earlyClaimPercent}
                    onChange={(e) => handleInputChange("earlyClaimPercent", e.target.value)}
                    placeholder="10"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-gray-400 text-sm mt-1">Percentage of tokens that can be claimed immediately</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Beneficiaries</h3>
              <div className="space-y-4">
                {formData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={beneficiary.address}
                        onChange={(e) => updateBeneficiary(index, "address", e.target.value)}
                        placeholder="Beneficiary address (0x...)"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={beneficiary.amount}
                        onChange={(e) => updateBeneficiary(index, "amount", e.target.value)}
                        placeholder="Amount"
                        min="0"
                        step="any"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => removeBeneficiary(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBeneficiary}
                  className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Beneficiary
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Review & Deploy</h3>
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Deployment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">Sepolia Testnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Token Type:</span>
                      <span className="text-white">{tokenType === "new" ? "New Token" : "Existing Token"}</span>
                    </div>
                    {tokenType === "new" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Token Name:</span>
                          <span className="text-white">{formData.tokenName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Token Symbol:</span>
                          <span className="text-white">{formData.tokenSymbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Supply:</span>
                          <span className="text-white">{formData.totalSupply}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Beneficiaries:</span>
                      <span className="text-white">{formData.beneficiaries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vesting Duration:</span>
                      <span className="text-white">{formData.totalDuration} days</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={deployContract}
                  disabled={isDeploying}
                  className="w-full py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Deploy Contract
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length || (currentStep === 1 && !tokenType)}
          className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
