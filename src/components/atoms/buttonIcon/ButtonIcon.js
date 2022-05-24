import { transparentize } from 'polished'
import React from 'react'
import styled, { css } from 'styled-components'
import { VARIANT } from '../../../theme/theme'

const StyledButton = styled.button`
  position: relative;
  background-color: ${({ theme, variant, bordered }) => {
    const color = theme.colors[variant ?? VARIANT.TRANSPARENT]
    return bordered ? 'transparent' : color?.main ?? 'transparent'
  }};
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;

  ${({ theme, bordered, variant }) => {
    return css`
      border-style: solid;
      border-width: 1px;
      border-color: ${bordered ? theme.colors[variant ?? VARIANT.TRANSPARENT]?.main : 'transparent'};
      border-radius: 12px;

      &:not([disabled]):hover,
      &:not([disabled]):focus,
      &:not([disabled]):active {
        box-shadow: ${() => `0 0 0 1px ${theme.colors[variant ?? VARIANT.TRANSPARENT]?.main}`};
        opacity: 1;
        background-color: ${transparentize(0.8, theme.colors.ntrl_light.main)};
      }
    `
  }};

  &:disabled {
    cursor: auto;
    opacity: 0.5;
  }
`

export const ButtonIcon = ({ variant, bordered, icon, ...rest }) => (
  <StyledButton variant={variant} bordered={bordered} {...rest}>
    {React.isValidElement(icon) && icon}
  </StyledButton>
)

ButtonIcon.defaultProps = {
  type: 'button',
  disabled: false,
  bordered: true,
}
