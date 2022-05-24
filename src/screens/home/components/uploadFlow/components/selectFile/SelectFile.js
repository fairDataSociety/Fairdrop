// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { memo, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import styled from 'styled-components/macro'
import { Box, Button, Tab, Tabs, Text, DropArea, FileInput, Input } from '../../../../../../components'
import { parameters } from '../../../../../../config/parameters'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../../hooks/fileManager/useFileManager'
import { FDSInstance, useMailbox } from '../../../../../../hooks/mailbox/useMailbox'
import { routes } from '../../../../../../config/routes'
import { useHistory } from 'react-router-dom'
import { useFormik } from 'formik'
import { useMediaQuery } from '../../../../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../../../../theme/theme'
import { Mobile } from './components/mobile/Mobile'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const DropAreaContainer = styled(Box)`
  width: 100%;
`

const TabContent = styled(Box)`
  margin: 16px 0;
  width: 100%;
`

const ActionButton = styled(Button)`
  margin-top: 8px;
`

const ActionButtonsContainer = styled(Box)`
  margin-top: 8px;
`

const noop = () => {}

const ENCRYPTED_STEPS = {
  FILE: 0,
  RECIPIENT: 1,
}

export const SelectFile = memo(({ onCancel, onStepChange, onStartUpload }) => {
  const [, { setFiles, setRecipient }] = useFileManager()
  const { getRootProps, isDragActive } = useDropzone({ onDrop: noop })
  const [{ mailbox }] = useMailbox()
  const history = useHistory()
  const [encryptedStep, setEncryptedStep] = useState(ENCRYPTED_STEPS.FILE)
  const maxTabletMediaQuery = useMediaQuery(`(max-width: ${DEVICE_SIZE.TABLET})`)

  const checkFileSize = useCallback((file) => {
    const hasEasterEggEnabled = parseInt(localStorage.getItem('hasEnabledMaxFileSizeEasterEgg')) === 1
    const maxFileSize = hasEasterEggEnabled ? parameters.easterEggMaxFileSize : parameters.maxFileSize
    const isValidSize = file.size <= maxFileSize
    if (!isValidSize) {
      toast.error(`🐝 Sorry but the file size is restricted to ${maxFileSize / (1024 * 1024)}mb`)
    }
    return isValidSize
  }, [])

  const handleLogin = useCallback(() => {
    history.push(routes.login)
  }, [history])

  const formik = useFormik({
    initialValues: {
      type: FILE_UPLOAD_TYPES.QUICK,
      file: null,
      recipient: '',
    },
    onSubmit: async (values) => {
      try {
        if (values?.recipient) {
          const result = await FDSInstance.Account.isMailboxNameAvailable(values?.recipient)
          if (result) {
            formik.setFieldError('recipient', "This mailbox doesn't exist. Type another!")
            return
          }
          setRecipient?.({ recipient: values?.recipient })
        }

        setFiles({ type: values?.type, files: [values?.file] })
        onStartUpload?.()
      } catch (error) {
        toast.error("Oops! We can't check the recipient mailbox right now")
      }
    },
  })

  const handleClean = useCallback(() => {
    formik.setFieldValue('file', null)
    setEncryptedStep(ENCRYPTED_STEPS.FILE)
  }, [formik])

  const handleQuickFileDrop = useCallback(
    (file) => {
      if (!checkFileSize(file)) {
        return
      }
      formik.setFieldValue('file', file)
      formik.setFieldTouched('file', true)
      formik.setFieldValue('type', FILE_UPLOAD_TYPES.QUICK)
      formik.setFieldTouched('type', true)
    },
    [formik],
  )

  const handleEncryptedFileDrop = useCallback((file) => {
    if (!checkFileSize(file)) {
      return
    }
    formik.setFieldValue('file', file)
    formik.setFieldTouched('file', true)
    formik.setFieldValue('type', FILE_UPLOAD_TYPES.ENCRYPTED)
    formik.setFieldTouched('type', true)
  }, [])

  const handleNextEncryptedStep = useCallback(() => {
    setEncryptedStep(ENCRYPTED_STEPS.RECIPIENT)

    if (maxTabletMediaQuery) {
      onStepChange?.(ENCRYPTED_STEPS.RECIPIENT)
    }
  }, [maxTabletMediaQuery])

  const handleCancelEncrypted = useCallback(() => {
    formik.resetForm()
    setEncryptedStep(ENCRYPTED_STEPS.FILE)
    console.info(onCancel)
    onCancel?.()
  }, [formik, onCancel])

  return (
    <Container {...getRootProps()} onSubmit={formik.handleSubmit}>
      {isDragActive && (
        <DropAreaContainer gap="16px" direction="column" vAlign="center" hAlign="center">
          <DropArea
            icon="folder"
            headline="Quick transfer"
            description="Drop your file here"
            onDrop={handleQuickFileDrop}
          />

          {mailbox && (
            <DropArea
              icon="folderEncrypted"
              headline="Encrypted transfer"
              description="Drop your file here"
              onDrop={handleEncryptedFileDrop}
            />
          )}
        </DropAreaContainer>
      )}

      {!isDragActive && !maxTabletMediaQuery && (
        <Tabs initialTab={formik?.values?.type === FILE_UPLOAD_TYPES.QUICK ? 0 : 1}>
          <Tab>Quick transfer</Tab>
          <Tab>Encrypted transfer</Tab>

          <TabContent direction="column" gap="16px">
            <Text size="m" weight="300" variant="black">
              Send files to anyone. Quick and easy
            </Text>

            <FileInput file={formik.values?.file} onFileChange={handleQuickFileDrop} onClean={handleClean} />

            <Text size="m" weight="300" variant="black">
              Or simply drop your file here
            </Text>

            <ActionButton variant="primary" disabled={!formik.values?.file} type="submit">
              Get transfer link
            </ActionButton>
          </TabContent>

          <TabContent direction="column" gap="16px">
            {!mailbox && (
              <>
                <Text size="m" weight="300" variant="black">
                  Send any file to any Fairdrop user in a more secure way. You must log in first.
                </Text>

                <ActionButton variant="primary" type="button" onClick={handleLogin}>
                  Log in
                </ActionButton>
              </>
            )}

            {mailbox && (
              <>
                <Text size="m" weight="300" variant="black">
                  Send files to any Fairdrop user in a more secure way. Encrypted end to end
                </Text>

                <FileInput file={formik.values?.file} onFileChange={handleEncryptedFileDrop} onClean={handleClean} />

                <Text size="m" weight="300" variant="black">
                  Or simply drop your file here
                </Text>

                {encryptedStep === ENCRYPTED_STEPS.FILE && (
                  <ActionButton
                    variant="primary"
                    disabled={!formik.values?.file}
                    type="button"
                    onClick={handleNextEncryptedStep}
                  >
                    Next
                  </ActionButton>
                )}

                {encryptedStep === ENCRYPTED_STEPS.RECIPIENT && (
                  <>
                    <Input
                      name="recipient"
                      value={formik.values.recipient}
                      label="Type the mailbox you want to send the file to"
                      placeholder="Mailbox name"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      hasError={formik.touched?.recipient && formik.errors?.recipient}
                      errorMessage={formik.errors?.recipient}
                    />

                    <ActionButtonsContainer vAling="center" gap="16px">
                      <Button variant="primary" disabled={!formik.values?.recipient} type="submit">
                        Encrypt & Send file
                      </Button>

                      <Button variant="primary" bordered type="button" onClick={handleCancelEncrypted}>
                        Cancel
                      </Button>
                    </ActionButtonsContainer>
                  </>
                )}
              </>
            )}
          </TabContent>
        </Tabs>
      )}

      {maxTabletMediaQuery && (
        <Mobile
          formik={formik}
          showRecipientForm={encryptedStep === ENCRYPTED_STEPS.RECIPIENT}
          onQuickFileChange={handleQuickFileDrop}
          onEncryptedFileChange={handleEncryptedFileDrop}
          onCancel={handleCancelEncrypted}
          onNextEncryptedStep={handleNextEncryptedStep}
        />
      )}
    </Container>
  )
})

SelectFile.displayName = 'SelectFile'
