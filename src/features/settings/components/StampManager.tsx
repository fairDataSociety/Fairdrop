/**
 * StampManager Component
 *
 * View and manage postage stamps for Swarm storage.
 * Shows available stamps, usage, and allows requesting sponsored stamps.
 */

import { useState, useCallback, useEffect } from 'react'
import type { BatchId } from '@ethersphere/bee-js'
import {
  getAllStamps,
  getStampCapacity,
  requestSponsoredStamp,
  getDefaultStampId,
  setDefaultStampId,
} from '@/services/swarm'
import { Button, Card, Badge, Progress } from '@/shared/components'
import type { PostageStamp } from '@/shared/types'

/**
 * StampManager props
 */
interface StampManagerProps {
  onStampSelected?: (stampId: string) => void
}

/**
 * Stamp capacity info
 */
interface StampCapacity {
  depth: number
  bucketDepth: number
  totalChunks: number
  buckets: number
  usable: boolean
  exists: boolean
}

/**
 * Format utilization percentage
 */
function formatUtilization(utilization: number): string {
  return `${(utilization * 100).toFixed(1)}%`
}

/**
 * Calculate remaining capacity
 */
function calculateRemainingGB(depth: number, utilization: number): string {
  const totalChunks = Math.pow(2, depth)
  const usedChunks = totalChunks * utilization
  const remainingChunks = totalChunks - usedChunks
  const remainingBytes = remainingChunks * 4096
  const remainingGB = remainingBytes / (1024 * 1024 * 1024)

  if (remainingGB >= 1) {
    return `${remainingGB.toFixed(2)} GB`
  }
  const remainingMB = remainingBytes / (1024 * 1024)
  return `${remainingMB.toFixed(0)} MB`
}

/**
 * Truncate stamp ID for display
 */
function truncateStampId(id: string): string {
  if (id.length <= 16) return id
  return `${id.slice(0, 8)}...${id.slice(-6)}`
}

/**
 * Stamp row component
 */
function StampRow({
  stamp,
  isDefault,
  onSetDefault,
  onViewDetails,
}: {
  stamp: PostageStamp
  isDefault: boolean
  onSetDefault: () => void
  onViewDetails: () => void
}) {
  const utilization = stamp.utilization || 0

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
      {/* Status indicator */}
      <div
        className={`w-3 h-3 rounded-full ${
          stamp.usable ? 'bg-green-500' : 'bg-red-500'
        }`}
      />

      {/* Stamp info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {truncateStampId(stamp.batchID)}
          </code>
          {isDefault && (
            <Badge variant="info" size="sm">
              Default
            </Badge>
          )}
          {stamp.label && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stamp.label}
            </span>
          )}
        </div>

        {/* Capacity bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Used: {formatUtilization(utilization)}</span>
            <span>~{calculateRemainingGB(stamp.depth, utilization)} remaining</span>
          </div>
          <Progress value={utilization * 100} size="sm" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isDefault && stamp.usable && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            Set Default
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          Details
        </Button>
      </div>
    </div>
  )
}

/**
 * Stamp details modal content
 */
function StampDetails({
  stamp,
  capacity,
  onClose,
}: {
  stamp: PostageStamp
  capacity: StampCapacity | null
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Stamp Details
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Batch ID
          </label>
          <code className="block mt-1 text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            {stamp.batchID}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Depth
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{stamp.depth}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Bucket Depth
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {stamp.bucketDepth || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Utilization
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {formatUtilization(stamp.utilization || 0)}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Status
            </label>
            <div className="mt-1">
              <Badge variant={stamp.usable ? 'success' : 'error'} size="sm">
                {stamp.usable ? 'Usable' : 'Unusable'}
              </Badge>
            </div>
          </div>
        </div>

        {capacity && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Total Chunks
              </label>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {capacity.totalChunks.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Buckets
              </label>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {capacity.buckets.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {stamp.amount && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Amount
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{stamp.amount}</p>
          </div>
        )}

        {stamp.blockNumber !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Block Number
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{stamp.blockNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * StampManager component
 */
export function StampManager({ onStampSelected }: StampManagerProps) {
  const [stamps, setStamps] = useState<PostageStamp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [defaultStampId, setDefaultStampIdState] = useState<string | null>(null)
  const [selectedStamp, setSelectedStamp] = useState<PostageStamp | null>(null)
  const [selectedCapacity, setSelectedCapacity] = useState<StampCapacity | null>(null)
  const [isRequestingSponsored, setIsRequestingSponsored] = useState(false)

  // Load stamps
  const loadStamps = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const allStamps = await getAllStamps()
      setStamps(allStamps)

      // Get default stamp
      const currentDefault = getDefaultStampId()
      setDefaultStampIdState(currentDefault as string | null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stamps'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadStamps()
  }, [loadStamps])

  // Set default stamp
  const handleSetDefault = useCallback(
    (stampId: string) => {
      setDefaultStampId(stampId as unknown as BatchId)
      setDefaultStampIdState(stampId)
      onStampSelected?.(stampId)
    },
    [onStampSelected]
  )

  // View stamp details
  const handleViewDetails = useCallback(async (stamp: PostageStamp) => {
    setSelectedStamp(stamp)
    const capacity = await getStampCapacity(stamp.batchID)
    setSelectedCapacity(capacity)
  }, [])

  // Close details
  const handleCloseDetails = useCallback(() => {
    setSelectedStamp(null)
    setSelectedCapacity(null)
  }, [])

  // Request sponsored stamp
  const handleRequestSponsored = useCallback(async () => {
    setIsRequestingSponsored(true)
    setError(null)

    try {
      const result = await requestSponsoredStamp()
      setDefaultStampId(result.batchId as unknown as BatchId)
      setDefaultStampIdState(result.batchId)
      await loadStamps()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request sponsored stamp'
      setError(message)
    } finally {
      setIsRequestingSponsored(false)
    }
  }, [loadStamps])

  // Loading state
  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-8">
          <svg
            className="w-8 h-8 animate-spin text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Postage Stamps
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stamps are required to store files on Swarm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadStamps}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRequestSponsored}
            disabled={isRequestingSponsored}
          >
            {isRequestingSponsored ? 'Requesting...' : 'Get Free Stamp'}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Stamp list */}
      {stamps.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="py-8">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Stamps Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You need a postage stamp to upload files. Get a free sponsored stamp to get started.
            </p>
            <Button onClick={handleRequestSponsored} disabled={isRequestingSponsored}>
              {isRequestingSponsored ? 'Requesting...' : 'Get Free Stamp'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stamps.map((stamp) => (
              <StampRow
                key={stamp.batchID}
                stamp={stamp}
                isDefault={stamp.batchID === defaultStampId}
                onSetDefault={() => handleSetDefault(stamp.batchID)}
                onViewDetails={() => handleViewDetails(stamp)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Details modal */}
      {selectedStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card padding="lg" className="w-full max-w-md">
            <StampDetails
              stamp={selectedStamp}
              capacity={selectedCapacity}
              onClose={handleCloseDetails}
            />
          </Card>
        </div>
      )}
    </div>
  )
}

export default StampManager
