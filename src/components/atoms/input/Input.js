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
import { VARIANT } from '../../../theme/theme'
import { Text } from '../text/Text'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const InputWrapper = styled.div`
  display: flex;
  height: 48px;
  position: relative;
`

const StyledInput = styled.input`
  flex: 1;
  height: 48px;
  background-color: ${({ theme }) => theme?.colors?.[VARIANT.WHITE]?.main};
  border: solid 1px ${({ theme }) => theme?.colors?.[VARIANT.NTRL_LIGHT]?.main};
  border-radius: 4px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 400;
  outline: none;
  box-sizing: border-box;

  ${({ hasIcon }) =>
    hasIcon &&
    css`
      padding-right: 58px;
    `}

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: ${({ theme }) => theme?.colors?.[VARIANT.NEGATIVE]?.main};
    `}
`

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme?.colors?.[VARIANT.BLACK]?.main};
`

const IconWrapper = styled.div`
  position: absolute;
  right: 20px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ErrorMessage = styled(Text)`
  margin-top: 4px;
`

export const Input = memo(({ className, id, label, name, icon, errorMessage, ...props }) => {
  return (
    <Container className={className}>
      {label && <Label htmlFor={id ?? name}>{label}</Label>}
      <InputWrapper>
        <StyledInput id={id ?? name} name={name} hasIcon={React.isValidElement(icon)} {...props} />
        {React.isValidElement(icon) && <IconWrapper>{icon}</IconWrapper>}
      </InputWrapper>
      {errorMessage && (
        <ErrorMessage variant="negative" size="sm" weight="300">
          {errorMessage}
        </ErrorMessage>
      )}
    </Container>
  )
})

Input.defaultProps = {
  type: 'text',
  disabled: false,
  name: '',
  label: '',
  placeholder: '',
  hasError: false,
  errorMessage: '',
}

Input.displayName = 'Input'
