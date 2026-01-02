/**
 * Local Storage Service
 * Type-safe localStorage wrapper for Fairdrop data persistence
 */

import type { Account, Message, HonestInbox } from '@/shared/types'

// Storage key constants
export const STORAGE_KEYS = {
  MAILBOXES: 'fairdrop_mailboxes_v2',
  INBOXES: 'fairdrop_inboxes',
  SETTINGS: 'fairdrop_settings',
  ACTIVE_ACCOUNT: 'fairdrop_active_account',
} as const

// Account storage helpers
export interface StoredMailboxes {
  [subdomain: string]: Account
}

// Message types for inbox storage
export type MessageType = 'received' | 'sent' | 'stored'

/**
 * Get all stored accounts
 */
export function getAccounts(): StoredMailboxes {
  const data = localStorage.getItem(STORAGE_KEYS.MAILBOXES)
  if (!data) return {}
  try {
    return JSON.parse(data) as StoredMailboxes
  } catch {
    return {}
  }
}

/**
 * Get a specific account by subdomain
 */
export function getAccount(subdomain: string): Account | null {
  const accounts = getAccounts()
  return accounts[subdomain.toLowerCase()] ?? null
}

/**
 * Save an account
 */
export function saveAccount(account: Account): void {
  const accounts = getAccounts()
  accounts[account.subdomain.toLowerCase()] = account
  localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(accounts))
}

/**
 * Delete an account
 */
export function deleteAccount(subdomain: string): void {
  const accounts = getAccounts()
  delete accounts[subdomain.toLowerCase()]
  localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(accounts))
}

/**
 * Get messages for an account
 */
export function getMessages(subdomain: string, type: MessageType): Message[] {
  const key = `${subdomain.toLowerCase()}_${type}`
  const data = localStorage.getItem(key)
  if (!data) return []
  try {
    return JSON.parse(data) as Message[]
  } catch {
    return []
  }
}

/**
 * Save messages for an account
 */
export function saveMessages(subdomain: string, type: MessageType, messages: Message[]): void {
  const key = `${subdomain.toLowerCase()}_${type}`
  localStorage.setItem(key, JSON.stringify(messages))
}

/**
 * Add a single message
 */
export function addMessage(subdomain: string, type: MessageType, message: Message): void {
  const messages = getMessages(subdomain, type)
  // Check for duplicates by reference
  if (!messages.some((m) => m.reference === message.reference)) {
    messages.unshift(message) // Add to beginning (newest first)
    saveMessages(subdomain, type, messages)
  }
}

/**
 * Delete a message by reference
 */
export function deleteMessage(subdomain: string, type: MessageType, reference: string): void {
  const messages = getMessages(subdomain, type)
  const filtered = messages.filter((m) => m.reference !== reference)
  saveMessages(subdomain, type, filtered)
}

// Honest Inbox storage
export interface StoredInboxes {
  [id: string]: HonestInbox
}

/**
 * Get all honest inboxes
 */
export function getHonestInboxes(): StoredInboxes {
  const data = localStorage.getItem(STORAGE_KEYS.INBOXES)
  if (!data) return {}
  try {
    return JSON.parse(data) as StoredInboxes
  } catch {
    return {}
  }
}

/**
 * Get a specific honest inbox
 */
export function getHonestInbox(id: string): HonestInbox | null {
  const inboxes = getHonestInboxes()
  return inboxes[id.toLowerCase()] ?? null
}

/**
 * Save a honest inbox
 */
export function saveHonestInbox(inbox: HonestInbox): void {
  const inboxes = getHonestInboxes()
  inboxes[inbox.id.toLowerCase()] = inbox
  localStorage.setItem(STORAGE_KEYS.INBOXES, JSON.stringify(inboxes))
}

/**
 * Delete a honest inbox
 */
export function deleteHonestInbox(id: string): void {
  const inboxes = getHonestInboxes()
  delete inboxes[id.toLowerCase()]
  localStorage.setItem(STORAGE_KEYS.INBOXES, JSON.stringify(inboxes))
}

// Settings storage
export interface FairdropSettings {
  theme?: 'light' | 'dark' | 'system'
  defaultStampId?: string
  beeUrl?: string
}

/**
 * Get settings
 */
export function getSettings(): FairdropSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (!data) return {}
  try {
    return JSON.parse(data) as FairdropSettings
  } catch {
    return {}
  }
}

/**
 * Save settings
 */
export function saveSettings(settings: Partial<FairdropSettings>): void {
  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
}

/**
 * Get active account subdomain
 */
export function getActiveAccountSubdomain(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT)
}

/**
 * Set active account subdomain
 */
export function setActiveAccountSubdomain(subdomain: string | null): void {
  if (subdomain) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, subdomain.toLowerCase())
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT)
  }
}

/**
 * Clear all Fairdrop data (for logout/reset)
 */
export function clearAllData(): void {
  const keys = Object.values(STORAGE_KEYS)
  keys.forEach((key) => localStorage.removeItem(key))

  // Also clear per-account message storage
  const accounts = getAccounts()
  Object.keys(accounts).forEach((subdomain) => {
    localStorage.removeItem(`${subdomain}_received`)
    localStorage.removeItem(`${subdomain}_sent`)
    localStorage.removeItem(`${subdomain}_stored`)
  })
}
