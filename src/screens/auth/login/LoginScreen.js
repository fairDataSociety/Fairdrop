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

import React, { useCallback, useMemo } from 'react'
import Text from '../../../components/atoms/text/Text'
import { routes } from '../../../config/routes'
import { useFormik } from 'formik'
import { schema } from './schema'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import { AuthLayout } from '../components/authLayout/AuthLayout'
import { Logo, Box, MetamaskButton, ImportButton, Input, Button, Select, Link, Icon } from '../../../components'
import { Link as RNLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import { DEVICE_SIZE } from '../../../theme/theme'
import { useMediaQuery } from '../../../hooks/useMediaQuery/useMediaQuery'

const Container = styled(Box)`
  height: 100%;
  box-sizing: border-box;
  padding: 40px;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    padding: 24px;
  }
`

const Header = styled(Box)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

const StyledLink = styled(RNLink)`
  &&& {
    color: ${({ theme }) => theme?.colors?.primary?.main};
  }
  font-weight: 600;
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

const StyledLogo = styled(Logo)`
  margin-bottom: 12px;
`

const Headline = styled(Text)`
  margin-bottom: 32px;
`

const Actions = styled(Box)`
  width: 100%;
`

const Separator = styled(Box)`
  width: 100%;

  &:after,
  &:before {
    content: '';
    display: block;
    height: 1px;
    background-color: ${({ theme }) => theme?.colors?.ntrl_light?.main};
    flex: 1;
  }
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SubmitButton = styled(Button)`
  align-self: flex-start;
  margin-top: 8px;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

const SignUpText = styled(Text)`
  margin-top: 8px;
`

const StyledIcon = styled(Icon)`
  margin-right: 6px;
`

const LoginScreen = ({ history, location }) => {
  const [{ accounts }, { unlockMailbox }] = useMailbox()
  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)
  const formik = useFormik({
    initialValues: {
      mailbox: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await unlockMailbox(values)

        if (location?.state?.from) {
          history.replace(location?.state?.from)
        } else {
          history.replace(routes.upload.home)
        }
      } catch {
        toast.error('💩 We could not unlock your mailbox. Please check your mailbox name and password')
      }
    },
  })

  const options = useMemo(() => {
    return accounts.map((subdomain) => {
      return { label: subdomain, value: subdomain }
    })
  }, [accounts])

  const handleMailboxChange = useCallback(
    ({ value }) => {
      formik.setFieldTouched('mailbox', true)
      formik.setFieldValue('mailbox', value)
    },
    [formik],
  )

  return (
    <AuthLayout>
      <Container direction="column" hAlign="center">
        {minTabletMediaQuery && (
          <Header margin="0 0 24px 0">
            <Link variant="transparent" to={routes.upload.home}>
              <StyledIcon name="close" />
              Close
            </Link>
            <Text variant="black" size="sm">
              Not a member? <StyledLink to={routes.register}>Sign up</StyledLink>
            </Text>
          </Header>
        )}

        <Content direction="column" vAlign="center">
          <StyledLogo size="l" />

          <Headline size="ml" variant="black">
            Log in to your account
          </Headline>

          <Actions gap="8px" direction="column">
            <MetamaskButton disabled />

            <ImportButton />
          </Actions>

          <Separator gap="12px" vAlign="center" margin="30px 0">
            <Text size="sm" variant="black">
              Or
            </Text>
          </Separator>

          <Form onSubmit={formik.handleSubmit}>
            <Select
              name="mailbox"
              value={formik.values.mailbox}
              label="Mailbox"
              placeholder="Select your mailbox's name"
              options={options}
              onChange={handleMailboxChange}
              onBlur={formik.handleBlur}
              hasError={formik.touched?.mailbox && formik.errors?.mailbox}
              errorMessage={formik.errors?.mailbox}
            />

            <Input
              name="password"
              value={formik.values.password}
              label="Password"
              placeholder="Type your password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              hasError={formik.touched?.password && formik.errors?.password}
              errorMessage={formik.errors?.password}
            />

            <SubmitButton type="submit" onClick={formik.handleSubmit} disabled={!formik.isValid || formik.isSubmitting}>
              Log in
            </SubmitButton>

            {!minTabletMediaQuery && (
              <SignUpText variant="black" size="sm">
                Not a member? <StyledLink to={routes.register}>Sign up</StyledLink>
              </SignUpText>
            )}
          </Form>
        </Content>
      </Container>
    </AuthLayout>
  )
}

export default React.memo(LoginScreen)
