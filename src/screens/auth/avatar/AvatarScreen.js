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

import React, { useCallback } from 'react'
import Text from '../../../components/atoms/text/Text'
import { routes } from '../../../config/routes'
import { useFormik } from 'formik'
import { schema } from './schema'
import { AuthLayout } from '../components/authLayout/AuthLayout'
import { Box, Button, Radio } from '../../../components'
import styled from 'styled-components/macro'
import { DEVICE_SIZE } from '../../../theme/theme'
import { AvatarPreview } from './components/avatarPreview/AvatarPreview'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'

const Container = styled(Box)`
  height: 100%;
  box-sizing: border-box;
  padding: 40px;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    padding: 24px;
  }
`

const Content = styled(Box)`
  flex: 1;
  width: 100%;
  max-width: 338px;
  overflow: auto;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    justify-content: flex-start;
  }
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StyledAvatarPreview = styled(AvatarPreview)`
  margin-bottom: 10px;
`

const Actions = styled(Box)`
  margin-top: 8px;
  flex-wrap: wrap;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

const StyledButton = styled(Button)`
  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

const AvatarScreen = ({ history, location }) => {
  const [, { updateAppState }] = useMailbox()

  const formik = useFormik({
    initialValues: {
      type: 'random',
      address: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      await updateAppState({ avatar: values })
      history.replace(routes.upload.home)
    },
  })

  const handleCancel = useCallback(() => {
    if (location?.state?.from) {
      history.replace(location?.state?.from)
    } else {
      history.replace(routes.upload.home)
    }
  }, [history, location])

  const handleAvatarChange = useCallback((address) => {
    formik.setFieldValue('address', address)
  }, [])

  return (
    <AuthLayout>
      <Container direction="column" hAlign="center">
        <Content direction="column" vAlign="center" gap="16px">
          <Text size="ml" variant="black">
            Select your avatar
          </Text>

          <Form onSubmit={formik.handleSubmit}>
            <StyledAvatarPreview
              type={formik.values?.type}
              address={formik.values?.address}
              onChange={handleAvatarChange}
            />

            <Radio
              name="type"
              value="random"
              checked={formik?.values?.type === 'random'}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              Random photo
            </Radio>

            <Radio
              name="type"
              value="nft"
              disabled
              checked={formik?.values?.type === 'nft'}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              Use NFT
            </Radio>

            <Actions gap="16px">
              <StyledButton
                type="submit"
                onClick={formik.handleSubmit}
                disabled={!formik.isValid || formik.isSubmitting}
              >
                Save
              </StyledButton>

              <StyledButton type="button" bordered onClick={handleCancel}>
                Cancel
              </StyledButton>
            </Actions>
          </Form>
        </Content>
      </Container>
    </AuthLayout>
  )
}

export default React.memo(AvatarScreen)
