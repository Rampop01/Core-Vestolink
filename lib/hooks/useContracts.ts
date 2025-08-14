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

  // Get vesting template
  // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD getVestingTemplate TO YOUR SMART CONTRACT:
  // const vestingTemplate = useReadContract({
  //   address: vestolinkAddress,
  //   abi: VESTOLINK_ABI,
  //   functionName: 'getVestingTemplate',
  //   chainId,
  // })

  // Get claimable amount for current user
  const claimableAmount = useReadContract({
    address: vestolinkAddress,
    abi: VESTOLINK_ABI,
    functionName: 'getClaimableAmount',
    args: address ? [address] : undefined,
    chainId,
  })

  // Get contract status
  // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD isActive TO YOUR SMART CONTRACT:
  // const isActive = useReadContract({
  //   address: vestolinkAddress,
  //   abi: VESTOLINK_ABI,
  //   functionName: 'isActive',
  //   chainId,
  // })

  // Write functions
  const claimTokens = useWriteContract()
  const depositTokens = useWriteContract()
  const createVestingSchedule = useWriteContract()
  
  // 🚧 COMMENTED OUT - UNCOMMENT WHEN YOU ADD THESE FUNCTIONS TO YOUR SMART CONTRACT:
  // const addBeneficiaries = useWriteContract()
  // const pauseContract = useWriteContract()
  // const unpauseContract = useWriteContract()
  // const revokeBeneficiary = useWriteContract()

  return {
    tokenAddress,
    beneficiaryCount,
    vestingSchedule,
    // vestingTemplate,        // 🚧 COMMENTED OUT
    claimableAmount,
    // isActive,              // 🚧 COMMENTED OUT
    claimTokens,
    depositTokens,
    createVestingSchedule,
    // addBeneficiaries,      // 🚧 COMMENTED OUT
    // pauseContract,         // 🚧 COMMENTED OUT
    // unpauseContract,       // 🚧 COMMENTED OUT
    // revokeBeneficiary,     // 🚧 COMMENTED OUT
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
