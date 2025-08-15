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
  {"type":"function","name":"cloneAddresses","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"contractIndex","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"deployVestolinkWithExistingToken","inputs":[{"name":"tokenAddress","type":"address","internalType":"address"}],"outputs":[{"name":"vestolinkAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"deployVestolinkWithToken","inputs":[{"name":"tokenName","type":"string","internalType":"string"},{"name":"tokenSymbol","type":"string","internalType":"string"},{"name":"totalSupply","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"vestolinkAddress","type":"address","internalType":"address"},{"name":"tokenAddress","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"deployedVestolinks","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"getAllProxiesByDeployer","inputs":[{"name":"deployerAddr","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"function","name":"getAllVestolinks","inputs":[],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"function","name":"getCloneAddress","inputs":[{"name":"_index","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"getCurrentIndex","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getDeployedCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getTokenForVestolink","inputs":[{"name":"vestolinkAddress","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"getUserVestolinks","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"function","name":"isClone","inputs":[{"name":"query","type":"address","internalType":"address"}],"outputs":[{"name":"result","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"userVestolinks","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"vestolinkImplementation","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"vestolinkToToken","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"VestolinkDeployed","inputs":[{"name":"deployer","type":"address","indexed":true,"internalType":"address"},{"name":"vestolinkAddress","type":"address","indexed":true,"internalType":"address"},{"name":"tokenAddress","type":"address","indexed":true,"internalType":"address"},{"name":"tokenName","type":"string","indexed":false,"internalType":"string"},{"name":"tokenSymbol","type":"string","indexed":false,"internalType":"string"},{"name":"totalSupply","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"position","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]}
] as const;

// VestolinkToken ABI  
export const TOKEN_ABI = [
  {"type":"constructor","inputs":[{"name":"name","type":"string","internalType":"string"},{"name":"symbol","type":"string","internalType":"string"},{"name":"totalSupply","type":"uint256","internalType":"uint256"},{"name":"initialOwner","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"approve","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"burn","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"burnFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},
  {"type":"function","name":"mint","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"spender","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"error","name":"ERC20InsufficientAllowance","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"allowance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},
  {"type":"error","name":"ERC20InsufficientBalance","inputs":[{"name":"sender","type":"address","internalType":"address"},{"name":"balance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},
  {"type":"error","name":"ERC20InvalidApprover","inputs":[{"name":"approver","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC20InvalidReceiver","inputs":[{"name":"receiver","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC20InvalidSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC20InvalidSpender","inputs":[{"name":"spender","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]}
] as const

// VestoLink ABI
export const VESTOLINK_ABI = [
  {"type":"constructor","inputs":[{"name":"_token","type":"address","internalType":"contract IERC20"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"beneficiaries","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"beneficiaryData","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"totalAmount","type":"uint256","internalType":"uint256"},{"name":"claimedAmount","type":"uint256","internalType":"uint256"},{"name":"templateId","type":"uint256","internalType":"uint256"},{"name":"airdropClaimed","type":"bool","internalType":"bool"},{"name":"revoked","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"claimEarlyClaim","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"claimTokens","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"createVestingSchedule","inputs":[{"name":"_beneficiaries","type":"address[]","internalType":"address[]"},{"name":"amounts","type":"uint256[]","internalType":"uint256[]"},{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"depositTokens","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"emergencyWithdraw","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"getAllVestingTemplates","inputs":[],"outputs":[{"name":"","type":"tuple[]","internalType":"struct VestoLink.VestingTemplate[]","components":[{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getBeneficiaries","inputs":[{"name":"start","type":"uint256","internalType":"uint256"},{"name":"end","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
  {"type":"function","name":"getBeneficiaryCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getClaimableAmount","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getContractBalance","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getTemplateCount","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getVestedAmount","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getVestingSchedule","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[{"name":"data","type":"tuple","internalType":"struct VestoLink.BeneficiaryData","components":[{"name":"totalAmount","type":"uint256","internalType":"uint256"},{"name":"claimedAmount","type":"uint256","internalType":"uint256"},{"name":"templateId","type":"uint256","internalType":"uint256"},{"name":"airdropClaimed","type":"bool","internalType":"bool"},{"name":"revoked","type":"bool","internalType":"bool"}],"name":"template","type":"tuple","internalType":"struct VestoLink.VestingTemplate","components":[{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getVestingTemplate","inputs":[{"name":"templateId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple","internalType":"struct VestoLink.VestingTemplate","components":[{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"initialize","inputs":[{"name":"_token","type":"address","internalType":"contract IERC20"},{"name":"_owner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"isBeneficiary","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"nextTemplateId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"pause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"paused","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"revokeVesting","inputs":[{"name":"beneficiary","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"token","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IERC20"}],"stateMutability":"view"},
  {"type":"function","name":"totalAllocated","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"unpause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"vestingTemplates","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"startTime","type":"uint256","internalType":"uint256"},{"name":"cliffDuration","type":"uint256","internalType":"uint256"},{"name":"totalDuration","type":"uint256","internalType":"uint256"},{"name":"releaseInterval","type":"uint256","internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"event","name":"BatchVestingCreated","inputs":[{"name":"beneficiaryCount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"totalAmount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"templateId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"EarlyClaimClaimed","inputs":[{"name":"beneficiary","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"Paused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"TokensClaimed","inputs":[{"name":"beneficiary","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"Unpaused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"VestingRevoked","inputs":[{"name":"beneficiary","type":"address","indexed":true,"internalType":"address"},{"name":"unvestedAmount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"VestingScheduleCreated","inputs":[{"name":"beneficiary","type":"address","indexed":true,"internalType":"address"},{"name":"totalAmount","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"templateId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"VestingTemplateCreated","inputs":[{"name":"templateId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"startTime","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"cliffDuration","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"totalDuration","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"releaseInterval","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"earlyClaimPercentage","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"earlyClaimEnabled","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},
  {"type":"error","name":"AlreadyInitialized","inputs":[]},
  {"type":"error","name":"AlreadyRevoked","inputs":[]},
  {"type":"error","name":"AmountMustBeGreaterThanZero","inputs":[]},
  {"type":"error","name":"ArraysLengthMismatch","inputs":[]},
  {"type":"error","name":"BeneficiaryAlreadyExists","inputs":[]},
  {"type":"error","name":"BeneficiaryZeroAddress","inputs":[]},
  {"type":"error","name":"EarlyClaimAlreadyClaimed","inputs":[]},
  {"type":"error","name":"EarlyClaimNotEnabled","inputs":[]},
  {"type":"error","name":"EarlyClaimPercentageMustBeGreaterThanZeroIfEnabled","inputs":[]},
  {"type":"error","name":"EarlyClaimPercentageTooHigh","inputs":[]},
  {"type":"error","name":"EmptyArrays","inputs":[]},
  {"type":"error","name":"EndOutOfBounds","inputs":[]},
  {"type":"error","name":"EnforcedPause","inputs":[]},
  {"type":"error","name":"ExpectedPause","inputs":[]},
  {"type":"error","name":"InsufficientBalance","inputs":[]},
  {"type":"error","name":"InvalidRange","inputs":[]},
  {"type":"error","name":"NoTokensToClaim","inputs":[]},
  {"type":"error","name":"NoVestingSchedule","inputs":[]},
  {"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnerZeroAddress","inputs":[]},
  {"type":"error","name":"ReentrancyGuardReentrantCall","inputs":[]},
  {"type":"error","name":"ReleaseIntervalMustBeGreaterThanZero","inputs":[]},
  {"type":"error","name":"SafeERC20FailedOperation","inputs":[{"name":"token","type":"address","internalType":"address"}]},
  {"type":"error","name":"TokenZeroAddress","inputs":[]},
  {"type":"error","name":"TotalDurationMustBeGreaterThanCliff","inputs":[]},
  {"type":"error","name":"VestingAlreadyRevoked","inputs":[]}
] as const;

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
