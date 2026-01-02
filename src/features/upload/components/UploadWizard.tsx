/**
 * UploadWizard Component
 *
 * Main upload wizard container that orchestrates all upload steps.
 */

import { useCallback } from 'react'
import { useUpload } from '../hooks/useUpload'
import { FileSelection } from './FileSelection'
import { RecipientInput } from './RecipientInput'
import { ModeSelection } from './ModeSelection'
import { UploadProgress } from './UploadProgress'
import { UploadComplete } from './UploadComplete'
import { Card } from '@/shared/components'

/**
 * Step indicator
 */
function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-1.5 rounded-full transition-all ${
            idx < currentStep
              ? 'w-8 bg-blue-500'
              : idx === currentStep
                ? 'w-8 bg-blue-500'
                : 'w-4 bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * UploadWizard component
 */
export function UploadWizard() {
  const {
    // File state
    file,
    setFile,

    // Recipient state
    recipientInput,
    resolvedRecipient,
    isResolvingRecipient,
    setRecipientInput,
    resolveRecipient,
    clearRecipient,

    // Mode state
    mode,
    setMode,

    // Upload state
    status,
    progress,
    error,
    result,

    // Actions
    startUpload,
    cancelUpload,
    reset,
    clearError,

    // Wizard helpers
    currentStep,
    isUploading,
  } = useUpload()

  // Step navigation handlers
  const handleFileSelected = useCallback(
    (newFile: File | null) => {
      setFile(newFile)
    },
    [setFile]
  )

  const handleFileContinue = useCallback(() => {
    // If file is selected, move to mode selection (or recipient if in send mode)
    if (file) {
      if (mode === 'send') {
        // Will show recipient input next
      } else {
        // Skip recipient for non-send modes
      }
    }
  }, [file, mode])

  const handleRecipientBack = useCallback(() => {
    clearRecipient()
    setFile(null)
  }, [clearRecipient, setFile])

  const handleRecipientContinue = useCallback(() => {
    // Recipient is resolved, proceed to mode selection
  }, [])

  const handleSkipRecipient = useCallback(() => {
    setMode('quick')
    clearRecipient()
  }, [setMode, clearRecipient])

  const handleModeBack = useCallback(() => {
    if (mode === 'send') {
      // Go back to recipient input
      clearRecipient()
    } else {
      // Go back to file selection
      setFile(null)
    }
  }, [mode, clearRecipient, setFile])

  const handleUpload = useCallback(async () => {
    await startUpload()
  }, [startUpload])

  const handleRetry = useCallback(async () => {
    clearError()
    await startUpload()
  }, [clearError, startUpload])

  const handleUploadAnother = useCallback(() => {
    reset()
  }, [reset])

  // Determine step number for indicator
  const getStepNumber = () => {
    switch (currentStep) {
      case 'file':
        return 0
      case 'recipient':
        return 1
      case 'mode':
        return mode === 'send' ? 2 : 1
      case 'progress':
        return mode === 'send' ? 3 : 2
      case 'complete':
        return mode === 'send' ? 4 : 3
      default:
        return 0
    }
  }

  const totalSteps = mode === 'send' ? 4 : 3

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Step indicator - hide on complete */}
      {currentStep !== 'complete' && (
        <StepIndicator currentStep={getStepNumber()} totalSteps={totalSteps} />
      )}

      {/* Step content */}
      <Card padding="lg" shadow="lg" rounded="xl">
        {currentStep === 'file' && (
          <FileSelection
            file={file}
            onFileSelect={handleFileSelected}
            onContinue={handleFileContinue}
          />
        )}

        {currentStep === 'recipient' && (
          <RecipientInput
            value={recipientInput}
            onChange={setRecipientInput}
            onResolve={resolveRecipient}
            resolvedRecipient={resolvedRecipient}
            isResolving={isResolvingRecipient}
            error={error}
            onContinue={handleRecipientContinue}
            onBack={handleRecipientBack}
            onSkip={handleSkipRecipient}
          />
        )}

        {currentStep === 'mode' && file && (
          <ModeSelection
            mode={mode}
            onModeChange={setMode}
            file={file}
            recipient={resolvedRecipient}
            onUpload={handleUpload}
            onBack={handleModeBack}
            isUploading={isUploading}
          />
        )}

        {currentStep === 'progress' && file && (
          <UploadProgress
            status={status}
            progress={progress}
            error={error}
            fileName={file.name}
            onCancel={cancelUpload}
            onRetry={handleRetry}
          />
        )}

        {currentStep === 'complete' && result && file && (
          <UploadComplete
            result={result}
            mode={mode}
            fileName={file.name}
            recipient={resolvedRecipient}
            onUploadAnother={handleUploadAnother}
          />
        )}
      </Card>
    </div>
  )
}

export default UploadWizard
