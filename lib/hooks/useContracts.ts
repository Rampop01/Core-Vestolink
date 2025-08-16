import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import { CONTRACTS, FACTORY_ABI, VESTOLINK_ABI, TOKEN_ABI } from '../web3'

export function useVestolinkFactory() {
  const chainId = useChainId()
  const { address } = useAccount()

  // Example: get all vestolinks
  const allVestolinks = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'getAllVestolinks',
    chainId,
  })

  // Example: get user vestolinks
  const userVestolinks = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: 'getUserVestolinks',
    args: address ? [address] : undefined,
    chainId,
  })

  // Example: deploy new vestolink with token
  const deployWithToken = useWriteContract()

  // Example: deploy with existing token
  const deployWithExistingToken = useWriteContract()

  return {
    allVestolinks,
    userVestolinks,
    deployWithToken,
    deployWithExistingToken,
  }
}

export function useVestolink(vestolinkAddress: `0x${string}`) {
  const chainId = useChainId()
  const { address } = useAccount()

  // Get token address from vestolink contract
  const tokenAddress = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'token',
    chainId,
  })

  // Get beneficiary count
  const beneficiaryCount = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getBeneficiaryCount',
    chainId,
  })

  // Get vesting schedule for current user
  const vestingSchedule = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getVestingSchedule',
    args: address ? [address] : undefined,
    chainId,
  })

  // Get all vesting templates
  const allVestingTemplates = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getAllVestingTemplates',
    chainId,
  })

  // Get specific vesting template (will use first template by default)
  const vestingTemplate = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getVestingTemplate',
    args: [BigInt(0)], // Get first template (templateId 0)
    chainId,
  })

  // Get first chunk of beneficiaries (0-49)
  const beneficiariesChunk = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getBeneficiaries',
    args: [BigInt(0), BigInt(49)], // Get first 50 beneficiaries
    chainId,
  })

  // Get claimable amount for current user
  const claimableAmount = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getClaimableAmount',
    args: address ? [address] : undefined,
    chainId,
  })

  // Get contract pause status
  const isPaused = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'paused',
    chainId,
  })

  // Get total allocated tokens
  const totalAllocated = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'totalAllocated',
    chainId,
  })

  // Get contract balance
  const contractBalance = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getContractBalance',
    chainId,
  })

  // Write functions
  const claimTokens = useWriteContract()
  const depositTokens = useWriteContract()
  const createVestingSchedule = useWriteContract()
  const pauseContract = useWriteContract()
  const unpauseContract = useWriteContract()
  const revokeVesting = useWriteContract()

  return {
    tokenAddress,
    beneficiaryCount,
    vestingSchedule,
    allVestingTemplates,
    vestingTemplate,
    beneficiariesChunk,
    claimableAmount,
    isPaused,
    totalAllocated,
    contractBalance,
    claimTokens,
    depositTokens,
    createVestingSchedule,
    pauseContract,
    unpauseContract,
    revokeVesting,
  }
}

export function useToken(tokenAddress: `0x${string}`) {
  const chainId = useChainId()
  const { address } = useAccount()

  // Get token name
  const name = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'name' as any,
    chainId,
  })

  // Get token symbol
  const symbol = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'symbol' as any,
    chainId,
  })

  // Get user balance
  const balance = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
  })

  // Get allowance for vestolink contracts
  const allowance = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VESTOLINK] : undefined,
    chainId,
  })

  // Write functions
  const transfer = useWriteContract()
  const approve = useWriteContract()

  return { 
    name, 
    symbol, 
    balance, 
    allowance, 
    transfer, 
    approve 
  }
}
