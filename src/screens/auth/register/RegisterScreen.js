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
import { useFormik } from 'formik'
import { schema } from './schema'
import { FDSInstance, useMailbox } from '../../../hooks/mailbox/useMailbox'
import { routes } from '../../../config/routes'
import { toast } from 'react-toastify'
import { AuthLayout } from '../components/authLayout/AuthLayout'
import styled from 'styled-components/macro'
import { Link as RNLink } from 'react-router-dom'
import { Logo, Box, MetamaskButton, Input, Button, Icon, Link } from '../../../components'
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

const LogInText = styled(Text)`
  margin-top: 8px;
`

const StyledIcon = styled(Icon)`
  margin-right: 6px;
`

const RegisterScreen = ({ history, location }) => {
  const [, { createMailbox }] = useMailbox()
  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)
  const formik = useFormik({
    initialValues: {
      mailbox: '',
      password: '',
      passwordConfirmation: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await createMailbox({
          mailbox: values.mailbox,
          password: values.password,
          callback: (message) => console.info(message),
        })

        if (location?.state?.from) {
          history.replace(location?.state?.from)
        } else {
          history.replace(routes.upload.home)
        }
      } catch {
        toast.error('🔥 Something went wrong while trying to create your mailbox :(')
      }
    },
  })

  const handleMailboxBlur = useCallback(async () => {
    const value = formik?.values?.mailbox
    if (!FDSInstance.Account.isMailboxNameValid(value)) {
      formik?.setFieldError('mailbox', 'This mailbox name already exists. Try another!')
      return
    }
    FDSInstance.Account.isMailboxNameAvailable(value)
      .then((result) => {
        if (!result) {
          formik?.setFieldError('mailbox', 'This mailbox name already exists. Try another!')
        }
      })
      .catch(() => {
        formik?.setFieldError('mailbox', 'This mailbox name already exists. Try another!')
      })
  }, [formik?.values, formik?.setFieldError])

  const hasMailboxError = useMemo(() => {
    return formik.touched?.mailbox && formik.errors?.mailbox
  }, [formik?.touched, formik?.errors])

  const isMailboxValid = useMemo(() => {
    return formik.touched?.mailbox && !formik.errors?.mailbox
  }, [formik?.touched, formik?.errors])

  const isPasswordValid = useMemo(() => {
    return (
      formik.touched?.password &&
      !formik.errors?.password &&
      formik.touched?.passwordConfirmation &&
      !formik.errors?.passwordConfirmation
    )
  }, [formik?.touched, formik?.errors])

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
              Already have an account? <StyledLink to={routes.login}>Log in</StyledLink>
            </Text>
          </Header>
        )}

        <Content direction="column" vAlign="center">
          <StyledLogo size="l" />

          <Headline size="ml" variant="black">
            Sign up to create your mailbox
          </Headline>

          <MetamaskButton disabled />

          <Separator gap="12px" vAlign="center" margin="30px 0">
            <Text size="sm" variant="black">
              Or
            </Text>
          </Separator>

          <Form onSubmit={formik.handleSubmit}>
            <Input
              name="mailbox"
              value={formik.values.mailbox}
              label="Mailbox"
              placeholder="Type your mailbox's name"
              type="text"
              onChange={formik.handleChange}
              onBlur={(evt) => {
                formik.handleBlur(evt)
                handleMailboxBlur()
              }}
              hasError={formik.touched?.mailbox && formik.errors?.mailbox}
              errorMessage={formik.errors?.mailbox}
              icon={isMailboxValid ? <Icon name="checkmark" /> : hasMailboxError ? <Icon name="warning" /> : null}
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

            <Input
              name="passwordConfirmation"
              value={formik.values.passwordConfirmation}
              placeholder="Verify your password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              hasError={formik.touched?.passwordConfirmation && formik.errors?.passwordConfirmation}
              errorMessage={formik.errors?.passwordConfirmation}
              icon={isPasswordValid ? <Icon name="checkmark" /> : null}
            />

            <SubmitButton type="submit" onClick={formik.handleSubmit} disabled={!formik.isValid || formik.isSubmitting}>
              Sign up
            </SubmitButton>

            {!minTabletMediaQuery && (
              <LogInText variant="black" size="sm">
                Already have an account? <StyledLink to={routes.login}>Log in</StyledLink>
              </LogInText>
            )}
          </Form>
        </Content>
      </Container>
    </AuthLayout>
  )
}

export default React.memo(RegisterScreen)
