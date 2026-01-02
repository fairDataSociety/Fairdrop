/**
 * ENS Integration Module
 * Handles ENS name resolution and text record lookup for Fairdrop
 */

import { ethers, JsonRpcProvider, BrowserProvider, Contract, namehash, keccak256, toUtf8Bytes } from 'ethers'
import type { InboxParams } from '@/shared/types'

// ENS text record key for Fairdrop public keys
export const FAIRDROP_KEY = 'io.fairdrop.publickey'

// ENS text record keys for GSOC inbox params
export const INBOX_OVERLAY_KEY = 'io.fairdrop.inbox.overlay'
export const INBOX_ID_KEY = 'io.fairdrop.inbox.id'
export const INBOX_PROX_KEY = 'io.fairdrop.inbox.prox'

// Configurable ENS domain for Fairdrop subdomains
export const ENS_DOMAIN = (import.meta.env.VITE_ENS_DOMAIN as string) || 'fairdrop.eth'

// Gasless registration API endpoint
export const ENS_REGISTRATION_API = (import.meta.env.VITE_ENS_REGISTRATION_API as string) || null

// Fallback public RPC endpoints
const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
]

// Cached provider
let cachedProvider: JsonRpcProvider | null = null

// Type for ethers provider (browser or JSON RPC)
type EthersProvider = BrowserProvider | JsonRpcProvider

// Result types
export interface RecipientResolution {
  publicKey: string | null
  method: 'direct' | 'ens' | 'ens-no-key' | 'fairdrop-subdomain' | 'fairdrop-no-key' | 'not-found' | 'invalid'
  ensName: string | null
  inboxParams?: InboxParams | null
}

export interface SubdomainCheck {
  exists: boolean
  ensName: string
  address: string | null
  publicKey: string | null
  inboxParams?: InboxParams | null
}

export interface RegistrationResult {
  success: boolean
  ensName: string
  txHash?: string
  error?: string
}

export interface UsernameAvailability {
  available: boolean
  reason?: string
}

export interface CanRegisterResult {
  canRegister: boolean
  reason?: string
}

export interface SetInboxParamsResult {
  success: boolean
  txHashes?: string[]
  error?: string
}

export interface MigrationResult {
  success: boolean
  txHashes?: string[]
  oldDomain?: string
  newDomain?: string
  error?: string
}

/**
 * Get an Ethereum provider for ENS lookups
 * Uses connected wallet if available, otherwise public RPC
 */
export function getProvider(): EthersProvider {
  // If MetaMask is connected, use it
  if (typeof window !== 'undefined' && window.ethereum) {
    return new BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
  }

  // Use cached provider if available
  if (cachedProvider) {
    return cachedProvider
  }

  // Create a fallback provider using public RPCs
  cachedProvider = new JsonRpcProvider(RPC_ENDPOINTS[0])
  return cachedProvider
}

/**
 * Resolve ENS name to Ethereum address
 */
export async function resolveENSName(ensName: string): Promise<string | null> {
  try {
    if (!ensName || typeof ensName !== 'string') {
      return null
    }

    if (!ensName.includes('.')) {
      return null
    }

    const provider = getProvider()
    const address = await provider.resolveName(ensName)
    return address
  } catch (error) {
    console.error('ENS resolution error:', error)
    return null
  }
}

/**
 * Get ENS text record
 */
export async function getENSTextRecord(ensName: string, key: string): Promise<string | null> {
  try {
    const provider = getProvider()
    const resolver = await provider.getResolver(ensName)

    if (!resolver) {
      return null
    }

    const value = await resolver.getText(key)
    return value || null
  } catch (error) {
    console.error('ENS text record error:', error)
    return null
  }
}

/**
 * Get Fairdrop public key from ENS text record
 */
export async function getFairdropPublicKey(ensName: string): Promise<string | null> {
  const publicKey = await getENSTextRecord(ensName, FAIRDROP_KEY)

  // Validate it looks like a public key
  if (publicKey) {
    const cleanKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey
    // Accept uncompressed (65 bytes = 130 hex) or compressed (33 bytes = 66 hex)
    if ((cleanKey.length === 130 || cleanKey.length === 66) && /^[a-fA-F0-9]+$/.test(cleanKey)) {
      return cleanKey
    }
  }

  return null
}

/**
 * Get GSOC inbox params from ENS text records
 */
export async function getInboxParams(ensName: string): Promise<InboxParams | null> {
  try {
    // Fetch all inbox params in parallel
    const [overlay, baseId, prox, publicKey] = await Promise.all([
      getENSTextRecord(ensName, INBOX_OVERLAY_KEY),
      getENSTextRecord(ensName, INBOX_ID_KEY),
      getENSTextRecord(ensName, INBOX_PROX_KEY),
      getFairdropPublicKey(ensName),
    ])

    // Require at least overlay and baseIdentifier
    if (!overlay || !baseId) {
      return null
    }

    const result: InboxParams = {
      targetOverlay: overlay,
      baseIdentifier: baseId,
      proximity: parseInt(prox ?? '16') || 16,
    }
    if (publicKey) {
      result.recipientPublicKey = publicKey
    }
    return result
  } catch (error) {
    console.error('ENS inbox params error:', error)
    return null
  }
}

/**
 * Reverse lookup: get ENS name for address
 */
export async function lookupAddress(address: string): Promise<string | null> {
  try {
    const provider = getProvider()
    const ensName = await provider.lookupAddress(address)
    return ensName
  } catch (error) {
    console.error('ENS reverse lookup error:', error)
    return null
  }
}

/**
 * Check if a name is a valid ENS name format
 */
export function isENSName(name: string): boolean {
  if (!name || typeof name !== 'string') return false

  const parts = name.toLowerCase().split('.')
  if (parts.length < 2) return false

  if (parts.some((part) => part.length === 0)) return false

  const validTLDs = ['eth', 'xyz', 'luxe', 'kred', 'art', 'club']
  const tld = parts[parts.length - 1]

  if (tld === 'eth') return true

  return validTLDs.includes(tld ?? '')
}

/**
 * Check if a Fairdrop subdomain exists and has a public key
 */
export async function checkFairdropSubdomain(username: string): Promise<SubdomainCheck> {
  const ensName = `${username}.${ENS_DOMAIN}`

  // Try registration API first
  if (ENS_REGISTRATION_API) {
    try {
      const apiBase = ENS_REGISTRATION_API.replace('/register', '')
      const response = await fetch(`${apiBase}/lookup/${username}`)
      if (response.ok) {
        const data = (await response.json()) as {
          exists?: boolean
          ensName?: string
          publicKey?: string
          inboxParams?: InboxParams
        }
        if (data.exists) {
          console.log(`[ENS] Found ${username} via registration API`)
          return {
            exists: true,
            ensName: data.ensName || ensName,
            address: '0x' + '0'.repeat(40),
            publicKey: data.publicKey?.replace('0x', '') || null,
            inboxParams: data.inboxParams || null,
          }
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      console.log('[ENS] Registration API lookup failed, trying direct ENS:', err.message)
    }
  }

  // Fall back to real ENS
  try {
    const publicKey = await getFairdropPublicKey(ensName)
    const address = await resolveENSName(ensName)

    return {
      exists: address !== null,
      ensName,
      address,
      publicKey,
    }
  } catch (error) {
    console.error('Fairdrop subdomain check error:', error)
    return {
      exists: false,
      ensName,
      address: null,
      publicKey: null,
    }
  }
}

/**
 * Resolve a recipient identifier to a public key
 */
export async function resolveRecipient(recipient: string): Promise<RecipientResolution> {
  if (!recipient || typeof recipient !== 'string') {
    return { publicKey: null, method: 'invalid', ensName: null }
  }

  const cleaned = recipient.trim()

  // Check if it's already a public key
  if (cleaned.startsWith('0x') && cleaned.length === 68) {
    return { publicKey: cleaned.slice(2), method: 'direct', ensName: null }
  }
  if (/^[a-fA-F0-9]{64,130}$/.test(cleaned)) {
    return { publicKey: cleaned, method: 'direct', ensName: null }
  }

  // Check if it's an ENS name
  if (isENSName(cleaned)) {
    const [publicKey, inboxParams] = await Promise.all([
      getFairdropPublicKey(cleaned),
      getInboxParams(cleaned),
    ])
    if (publicKey) {
      return { publicKey, method: 'ens', ensName: cleaned, inboxParams }
    }
    return { publicKey: null, method: 'ens-no-key', ensName: cleaned, inboxParams: null }
  }

  // Try as fairdrop.eth subdomain
  if (/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(cleaned.toLowerCase())) {
    const result = await checkFairdropSubdomain(cleaned.toLowerCase())
    if (result.publicKey) {
      const inboxParams = result.inboxParams || (await getInboxParams(result.ensName))
      return {
        publicKey: result.publicKey,
        method: 'fairdrop-subdomain',
        ensName: result.ensName,
        inboxParams,
      }
    }
    if (result.exists) {
      return { publicKey: null, method: 'fairdrop-no-key', ensName: result.ensName, inboxParams: null }
    }
  }

  return { publicKey: null, method: 'not-found', ensName: null, inboxParams: null }
}

/**
 * Register a Fairdrop subdomain via gasless API
 */
export async function registerSubdomainGasless(
  username: string,
  publicKey: string,
  options: { gsocParams?: InboxParams } = {}
): Promise<RegistrationResult> {
  const ensName = `${username}.${ENS_DOMAIN}`

  if (!ENS_REGISTRATION_API) {
    console.log('[ENS] No registration API configured, skipping gasless registration')
    return {
      success: false,
      ensName,
      error: 'No registration API configured',
    }
  }

  try {
    console.log(`[ENS] Registering ${ensName} via API...`)

    const response = await fetch(ENS_REGISTRATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        publicKey: publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`,
        inboxParams: options.gsocParams || null,
      }),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(errorData.error || `Registration failed: ${response.status}`)
    }

    const result = (await response.json()) as { txHash?: string }
    console.log(`[ENS] Registered ${ensName} successfully`)

    const registrationResult: RegistrationResult = {
      success: true,
      ensName,
    }
    if (result.txHash) {
      registrationResult.txHash = result.txHash
    }
    return registrationResult
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[ENS] Gasless registration error:', error)
    return {
      success: false,
      ensName,
      error: err.message,
    }
  }
}

/**
 * Register a Fairdrop subdomain with public key on ENS
 * Tries gasless API first, falls back to wallet if available
 */
export async function registerFairdropSubdomain(
  username: string,
  publicKey: string,
  options: { gsocParams?: InboxParams } = {}
): Promise<RegistrationResult> {
  // Try gasless API first
  if (ENS_REGISTRATION_API) {
    const gaslessResult = await registerSubdomainGasless(username, publicKey, options)
    if (gaslessResult.success) {
      return gaslessResult
    }
    console.log('[ENS] Gasless registration failed, trying wallet...')
  }

  // Fall back to wallet-based registration
  const ensName = `${username}.${ENS_DOMAIN}`

  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet not connected. Please connect MetaMask to register on ENS.')
    }

    const provider = new BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()

    console.log(`[ENS] Registering ${ensName} for ${signerAddress}`)

    // Get ENS registry contract
    const ensRegistry = new Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry (mainnet)
      [
        'function resolver(bytes32 node) view returns (address)',
        'function owner(bytes32 node) view returns (address)',
        'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)',
      ],
      signer
    )

    // Calculate namehash
    const parentNode = namehash(ENS_DOMAIN)
    const labelHash = keccak256(toUtf8Bytes(username))
    const subdomainNode = namehash(ensName)

    // Check if subdomain already exists
    const ownerFn = ensRegistry.getFunction('owner')
    const existingOwner = (await ownerFn(subdomainNode)) as string
    if (existingOwner !== ethers.ZeroAddress && existingOwner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(`Subdomain ${ensName} is already owned by another address`)
    }

    // Get parent resolver
    const resolverFn = ensRegistry.getFunction('resolver')
    const parentResolver = (await resolverFn(parentNode)) as string
    if (parentResolver === ethers.ZeroAddress) {
      throw new Error(`Parent domain ${ENS_DOMAIN} has no resolver`)
    }

    // If subdomain doesn't exist, create it
    if (existingOwner === ethers.ZeroAddress) {
      console.log(`[ENS] Creating subdomain ${ensName}...`)
      const setSubnodeFn = ensRegistry.getFunction('setSubnodeRecord')
      const tx = await setSubnodeFn(parentNode, labelHash, signerAddress, parentResolver, 0)
      await tx.wait()
      console.log(`[ENS] Subdomain created: ${tx.hash}`)
    }

    // Set text record for public key
    const resolverContract = new Contract(
      parentResolver,
      ['function setText(bytes32 node, string key, string value)'],
      signer
    )

    console.log(`[ENS] Setting public key for ${ensName}...`)
    const cleanKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`
    const setTextFn = resolverContract.getFunction('setText')
    const tx = await setTextFn(subdomainNode, FAIRDROP_KEY, cleanKey)
    await tx.wait()
    console.log(`[ENS] Public key set: ${tx.hash}`)

    // Optionally set GSOC inbox params
    if (options.gsocParams) {
      await setInboxParams(ensName, options.gsocParams)
    }

    return {
      success: true,
      ensName,
      txHash: tx.hash as string,
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[ENS] Registration error:', error)
    return {
      success: false,
      ensName,
      error: err.message,
    }
  }
}

/**
 * Set GSOC inbox params on ENS text records
 */
export async function setInboxParams(
  ensName: string,
  gsocParams: Partial<InboxParams>
): Promise<SetInboxParamsResult> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet not connected')
    }

    const provider = new BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
    const signer = await provider.getSigner()

    const node = namehash(ensName)

    // Get resolver for this name
    const resolver = await provider.getResolver(ensName)
    if (!resolver) {
      throw new Error(`No resolver found for ${ensName}`)
    }

    const resolverAddress = await resolver.getAddress()
    if (!resolverAddress) {
      throw new Error(`Resolver has no address for ${ensName}`)
    }

    const resolverContract = new Contract(
      resolverAddress,
      ['function setText(bytes32 node, string key, string value)'],
      signer
    )

    const txHashes: string[] = []
    const setTextFn = resolverContract.getFunction('setText')

    // Set overlay
    if (gsocParams.targetOverlay) {
      console.log(`[ENS] Setting inbox overlay for ${ensName}...`)
      const tx = await setTextFn(node, INBOX_OVERLAY_KEY, gsocParams.targetOverlay)
      await tx.wait()
      txHashes.push(tx.hash as string)
    }

    // Set base identifier
    if (gsocParams.baseIdentifier) {
      console.log(`[ENS] Setting inbox ID for ${ensName}...`)
      const tx = await setTextFn(node, INBOX_ID_KEY, gsocParams.baseIdentifier)
      await tx.wait()
      txHashes.push(tx.hash as string)
    }

    // Set proximity
    if (gsocParams.proximity) {
      console.log(`[ENS] Setting inbox proximity for ${ensName}...`)
      const tx = await setTextFn(node, INBOX_PROX_KEY, gsocParams.proximity.toString())
      await tx.wait()
      txHashes.push(tx.hash as string)
    }

    console.log(`[ENS] Inbox params set for ${ensName}`)
    return { success: true, txHashes }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[ENS] Set inbox params error:', error)
    return { success: false, error: err.message }
  }
}

/**
 * Check if user has permission to register subdomains on fairdrop.eth
 */
export async function canRegisterSubdomain(): Promise<CanRegisterResult> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return { canRegister: false, reason: 'No wallet connected' }
    }

    const provider = new BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()

    const ensRegistry = new Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      [
        'function owner(bytes32 node) view returns (address)',
        'function isApprovedForAll(address owner, address operator) view returns (bool)',
      ],
      provider
    )

    const parentNode = namehash(ENS_DOMAIN)
    const ownerFn = ensRegistry.getFunction('owner')
    const parentOwner = (await ownerFn(parentNode)) as string

    if (parentOwner.toLowerCase() === signerAddress.toLowerCase()) {
      return { canRegister: true }
    }

    const isApprovedFn = ensRegistry.getFunction('isApprovedForAll')
    const isApproved = (await isApprovedFn(parentOwner, signerAddress)) as boolean
    if (isApproved) {
      return { canRegister: true }
    }

    return {
      canRegister: false,
      reason: `Only the owner of ${ENS_DOMAIN} can register subdomains`,
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return { canRegister: false, reason: err.message }
  }
}

/**
 * Check if username is available on fairdrop.eth
 */
export async function checkUsernameAvailability(username: string): Promise<UsernameAvailability> {
  if (!username || typeof username !== 'string') {
    return { available: false, reason: 'Invalid username' }
  }

  const cleaned = username.toLowerCase().trim()

  if (cleaned.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters' }
  }
  if (cleaned.length > 32) {
    return { available: false, reason: 'Username must be 32 characters or less' }
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleaned) && !/^[a-z0-9]$/.test(cleaned)) {
    return { available: false, reason: 'Username can only contain letters, numbers, and hyphens' }
  }

  const reserved = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'help', 'support', 'info']
  if (reserved.includes(cleaned)) {
    return { available: false, reason: 'This username is reserved' }
  }

  const result = await checkFairdropSubdomain(cleaned)
  if (result.exists) {
    return { available: false, reason: 'Username is already taken' }
  }

  return { available: true }
}

/**
 * Migrate from fairdrop.eth subdomain to a custom ENS domain
 */
export async function migrateToCustomDomain(
  customDomain: string,
  sourceUsername: string
): Promise<MigrationResult> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet not connected')
    }

    const provider = new BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    const domainAddress = await resolveENSName(customDomain)

    if (!domainAddress) {
      throw new Error(`Domain ${customDomain} not found on ENS`)
    }

    if (domainAddress.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(`You don't own ${customDomain}. Connect the wallet that owns it.`)
    }

    // Get current fairdrop.eth data
    const sourceName = `${sourceUsername}.${ENS_DOMAIN}`
    const [publicKey, inboxParams] = await Promise.all([
      getFairdropPublicKey(sourceName),
      getInboxParams(sourceName),
    ])

    if (!publicKey) {
      throw new Error(`No public key found on ${sourceName}`)
    }

    const txHashes: string[] = []

    // Get resolver for target domain
    const resolver = await provider.getResolver(customDomain)
    if (!resolver) {
      throw new Error(`No resolver found for ${customDomain}. Please set up a resolver first.`)
    }

    const node = namehash(customDomain)
    const resolverAddr = await resolver.getAddress()
    if (!resolverAddr) {
      throw new Error(`Resolver has no address for ${customDomain}`)
    }

    const resolverContract = new Contract(
      resolverAddr,
      ['function setText(bytes32 node, string key, string value)'],
      signer
    )
    const setTextFn = resolverContract.getFunction('setText')

    // Set public key
    console.log(`[ENS] Setting public key on ${customDomain}...`)
    const cleanKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`
    const tx1 = await setTextFn(node, FAIRDROP_KEY, cleanKey)
    await tx1.wait()
    txHashes.push(tx1.hash as string)
    console.log(`[ENS] Public key migrated: ${tx1.hash}`)

    // Set inbox params if available
    if (inboxParams) {
      console.log(`[ENS] Migrating inbox params to ${customDomain}...`)

      if (inboxParams.targetOverlay) {
        const tx = await setTextFn(node, INBOX_OVERLAY_KEY, inboxParams.targetOverlay)
        await tx.wait()
        txHashes.push(tx.hash as string)
      }

      if (inboxParams.baseIdentifier) {
        const tx = await setTextFn(node, INBOX_ID_KEY, inboxParams.baseIdentifier)
        await tx.wait()
        txHashes.push(tx.hash as string)
      }

      if (inboxParams.proximity) {
        const tx = await setTextFn(node, INBOX_PROX_KEY, inboxParams.proximity.toString())
        await tx.wait()
        txHashes.push(tx.hash as string)
      }

      console.log(`[ENS] Inbox params migrated`)
    }

    return {
      success: true,
      txHashes,
      oldDomain: sourceName,
      newDomain: customDomain,
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[ENS] Migration error:', error)
    return {
      success: false,
      error: err.message,
    }
  }
}
