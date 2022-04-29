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

import React, { memo } from 'react'
import styled, { css } from 'styled-components/macro'
import { Link as RNLink } from 'react-router-dom'
import { useMailbox } from '../../../../../../../../hooks/mailbox/useMailbox'
import { Text, FileInput, Button, Input } from '../../../../../../../../components'
import { QuickTransferButton } from '../quickTransferButton/QuickTransferButton'
import { EncryptedTransferButton } from '../encryptedTransferButton/EncryptedTransferButton'
import { routes } from '../../../../../../../../config/routes'
import { FILE_UPLOAD_TYPES } from '../../../../../../../../hooks/fileManager/useFileManager'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  ${({ showRecipientForm }) =>
    showRecipientForm &&
    css`
      height: 100%;
    `}
`

const StyledLink = styled(RNLink)`
  &&& {
    color: ${({ theme }) => theme?.colors?.primary?.main};
  }
  font-weight: 600;
`

const ActionButton = styled(Button)`
  width: 100%;
`

const Actions = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
`

export const Mobile = memo(
  ({ formik, onQuickFileChange, onEncryptedFileChange, onCancel, showRecipientForm, onNextEncryptedStep }) => {
    const [{ mailbox }] = useMailbox()
    return (
      <Container showRecipientForm={showRecipientForm}>
        {!showRecipientForm && (
          <>
            <Text size="ml" weight="500" variant="black">
              Upload your files
            </Text>
            {!formik?.values?.file && (
              <>
                <QuickTransferButton onFileChange={onQuickFileChange} />

                <EncryptedTransferButton disabled={!mailbox} onFileChange={onEncryptedFileChange} />

                {!mailbox && (
                  <Text variant="black" size="sm">
                    <StyledLink to={routes.login}>Log in/Sign up</StyledLink> to make an encrypted transfer
                  </Text>
                )}
              </>
            )}

            {formik?.values?.file && (
              <>
                <FileInput file={formik?.values?.file} />

                {formik?.values?.type === FILE_UPLOAD_TYPES.QUICK && (
                  <ActionButton variant="primary" type="submit">
                    Get transfer link
                  </ActionButton>
                )}

                {formik?.values?.type === FILE_UPLOAD_TYPES.ENCRYPTED && (
                  <ActionButton variant="primary" type="button" onClick={onNextEncryptedStep}>
                    Next
                  </ActionButton>
                )}

                <ActionButton variant="primary" bordered type="button" onClick={onCancel}>
                  Cancel
                </ActionButton>
              </>
            )}
          </>
        )}

        {showRecipientForm && (
          <>
            <Text size="ml" weight="500" variant="black">
              Type the mailbox you want to send the file to
            </Text>

            <FileInput file={formik?.values?.file} />

            <Input
              name="recipient"
              value={formik?.values?.recipient}
              placeholder="Mailbox name"
              type="text"
              onChange={formik?.handleChange}
              onBlur={formik?.handleBlur}
              hasError={formik?.touched?.recipient && formik.errors?.recipient}
              errorMessage={formik?.errors?.recipient}
            />

            <Actions>
              <ActionButton variant="primary" disabled={!formik.values?.recipient} type="submit">
                Encrypt & Send file
              </ActionButton>

              <ActionButton variant="primary" bordered type="button" onClick={onCancel}>
                Cancel
              </ActionButton>
            </Actions>
          </>
        )}
      </Container>
    )
  },
)

Mobile.displayName = 'Mobile'
