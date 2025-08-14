import { ethers } from "ethers"

// Contract addresses - Core Blockchain
export const CONTRACTS = {
  FACTORY: "0x79Be9ADFD220a3e79d4b1EB44A66736c312e1F98" as const,
  VESTOLINK: "0x9451697d4e73e021f04242f1b2d39791d027fda0" as const,
  TOKEN: "0x106d1b714e2fa326eec5f24424a472d6a3b60a70" as const,
}

// VestolinkFactory ABI
export const FACTORY_ABI = [
  {"type":"constructor","inputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"deployVestolinkWithToken","inputs":[{"name":"tokenName","type":"string","internalType":"string"},{"name":"tokenSymbol","type":"string","internalType":"string"},{"name":"totalSupply","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"vestolinkAddress","type":"address","internalType":"address"},{"name":"tokenAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"deployVestolinkWithExistingToken","inputs":[{"name":"tokenAddress","type":"address","internalType":"address"}],"outputs":[{"name":"vestolinkAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"getUserVestolinks","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"function","name":"getAllVestolinks","inputs":[],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"event","name":"VestolinkDeployed","inputs":[{"name":"deployer","type":"address","indexed":true,"internalType":"address"},{"name":"vestolinkAddress","type":"address","indexed":true,"internalType":"address"},{"name":"tokenAddress","type":"address","indexed":true,"internalType":"address"},{"name":"tokenName","type":"string","indexed":false,"internalType":"string"},{"name":"tokenSymbol","type":"string","indexed":false,"internalType":"string"},{"name":"totalSupply","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"position","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false}
] as const

// VestolinkToken ABI  
export const TOKEN_ABI = [
  {"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},
  {"type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"approve","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"}
] as const

// VestoLink ABI
export const VESTOLINK_ABI = [
  {"type":"function","name":"token","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"createVestingSchedule","inputs":[{"name":"_beneficiaries","type":"address[]","internalType":"address[]"},{"name":"amounts","type":"uint256[]","internalType":"uint256[]"},{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"claimTokens","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"getClaimableAmount","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getVestingSchedule","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[{"name":"data","type":"tuple","internalType":"struct VestoLink.BeneficiaryData","components":[{"name":"totalAmount","type":"uint256","internalType":"uint256"},{"name":"claimedAmount","type":"uint256","internalType":"uint256"},{"name":"templateId","type":"uint256","internalType":"uint256"},{"name":"airdropClaimed","type":"bool","internalType":"bool"},{"name":"revoked","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getBeneficiaryCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"depositTokens","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  
  // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD THESE FUNCTIONS TO YOUR SMART CONTRACT:
  // {"type":"function","name":"addBeneficiaries","inputs":[{"name":"_beneficiaries","type":"address[]","internalType":"address[]"},{"name":"amounts","type":"uint256[]","internalType":"uint256[]"}],"outputs":[],"stateMutability":"nonpayable"},
  // {"type":"function","name":"pause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  // {"type":"function","name":"unpause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  // {"type":"function","name":"revokeBeneficiary","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  // {"type":"function","name":"getVestingTemplate","inputs":[],"outputs":[{"name":"template","type":"tuple","internalType":"struct VestoLink.VestingTemplate","components":[{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  // {"type":"function","name":"isActive","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"}
] as const

// Utility functions
export const formatTokenAmount = (amount: string | number, decimals = 18): string => {
  return ethers.formatUnits(amount.toString(), decimals)
}

export const parseTokenAmount = (amount: string, decimals = 18): bigint => {
  return ethers.parseUnits(amount, decimals)
}

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getExplorerUrl = (hash: string, type: "tx" | "address" = "tx"): string => {
  return `https://scan.test.btcs.network/${type}/${hash}`
}
