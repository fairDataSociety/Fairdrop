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

import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box } from '../box/Box'
import { Label } from '../label/Label'
import styled, { css } from 'styled-components/macro'
import { VARIANT } from '../../../theme/theme'
import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'
import { transparentize } from 'polished'

const Container = styled(Box)`
  position: relative;
  width: 100%;
`

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
  position: relative;
`

const IconWrapper = styled.button`
  position: absolute;
  right: 0;
  top: 1px;
  bottom: 1px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  outline: none;
  background-color: transparent;
  border-left: solid 1px ${({ theme }) => theme?.colors?.[VARIANT.NTRL_LIGHT]?.main};
  box-sizing: border-box;
`

const Input = styled.input`
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
  caret-color: transparent;

  &:focus {
    border-color: ${({ theme }) => theme?.colors?.[VARIANT.BLACK]?.main};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    + ${IconWrapper} {
      border-color: ${({ theme }) => theme?.colors?.[VARIANT.BLACK]?.main};
    }
  }

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: ${({ theme }) => theme?.colors?.[VARIANT.NEGATIVE]?.main};
    `}
`

const ErrorMessage = styled(Text)`
  margin-top: 4px;
`

const Options = styled.ul`
  position: absolute;
  top: 100%;
  width: 100%;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  max-height: 150px;
  overflow: auto;
  z-index: 1000;

  ${({ theme, expanded }) => css`
    border: solid 1px ${theme?.colors?.[VARIANT.BLACK]?.main};
    border-top: 0;
    display: ${expanded ? 'block' : 'none'};
    background: ${({ theme }) => theme?.colors?.[VARIANT.WHITE]?.main};
  `};
`

const Option = styled.li`
  list-style: none;
  height: 48px;
  padding: 14px 16px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  transition: background-color 0.3s ease;
  cursor: pointer;

  &:hover,
  &:focus,
  &:active {
    background-color: ${({ theme }) => transparentize(0.8, theme.colors.ntrl_light.main)};
  }
`

export const Select = memo(
  ({ className, label, id, name, errorMessage, options, onFocus, onChange, selectedOption, hasError, ...props }) => {
    const inputRef = useRef()
    const wrapperRef = useRef()
    const [{ expanded }, setState] = useState({ expanded: false })

    const handleDropDownClick = () => {
      setState((old) => ({ ...old, expanded: !old?.expanded }))
    }

    const handleFocus = (evt) => {
      setState((old) => ({ ...old, expanded: true }))
      onFocus?.(evt)
    }

    const handleClickOption = (option) => {
      setState((old) => ({ ...old, expanded: !expanded }))
      onChange?.(option)
    }

    const value = useMemo(() => {
      return options?.find(({ value }) => value === selectedOption)?.label ?? ''
    }, [options, selectedOption])

    useEffect(() => {
      const handleClickOutside = (evt) => {
        if (!wrapperRef?.current?.contains(evt.target)) {
          setState((old) => ({ ...old, expanded: false }))
        }
      }
      document.addEventListener('click', handleClickOutside, true)
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
      }
    }, [])

    useEffect(() => {
      expanded ? inputRef?.current?.focus() : inputRef?.current?.blur()
    }, [expanded])

    return (
      <Container direction="column" className={className}>
        {label && <Label htmlFor={id ?? name}>{label}</Label>}
        <InputWrapper ref={wrapperRef} aria-haspopup="listbox" aria-labelledby={`select-${id}`}>
          <Input
            ref={inputRef}
            id={id ?? name}
            name={name}
            autoComplete="false"
            readOnly={true}
            onFocus={handleFocus}
            value={value}
            hasError={hasError}
            {...props}
          />
          <IconWrapper onClick={handleDropDownClick} type="button">
            <Icon name="dropdown" />
          </IconWrapper>

          <Options id={`select-${id}`} role="listbox" expanded={expanded}>
            {options?.map((option) => {
              return (
                <Option key={option.value} onClick={() => handleClickOption(option)}>
                  {option.label}
                </Option>
              )
            })}
          </Options>
        </InputWrapper>

        {hasError && errorMessage && (
          <ErrorMessage variant="negative" size="sm" weight="300">
            {errorMessage}
          </ErrorMessage>
        )}
      </Container>
    )
  },
)

Select.displayName = 'Select'

export default Select
