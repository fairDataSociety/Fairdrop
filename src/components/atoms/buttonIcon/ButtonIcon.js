import React from 'react'
import styled, { css } from 'styled-components'
import { VARIANT } from '../../../theme/theme'

const StyledButton = styled.button`
  position: relative;
  background-color: ${({ theme, variant, bordered }) => {
    const color = theme.colors[variant ?? VARIANT.TRANSPARENT]
    return bordered ? 'transparent' : color?.main ?? 'transparent'
  }};
  width: ${({ theme }) => theme.components.buttonIcon.width};
  height: ${({ theme }) => theme.components.buttonIcon.height};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;

  ${({ theme, variant }) => {
    const { style, width, radius } = theme?.components?.buttonIcon?.border ?? {}

    return css`
      border-style: ${style};
      border-width: ${width};
      border-color: ${theme.colors[variant ?? VARIANT.TRANSPARENT]?.main};
      border-radius: ${radius};

      &:not([disabled]):hover,
      &:not([disabled]):focus,
      &:not([disabled]):active {
        box-shadow: ${() => `0 0 0 1px ${theme.colors[variant ?? VARIANT.TRANSPARENT]?.main}`};
        opacity: ${({ theme }) => `${theme?.components?.buttonIcon?.hover?.opacity}`};
        background-color: ${({ theme, bordered }) => bordered && theme?.components?.buttonIcon?.hover?.backgroundColor};
      }
    `
  }};

  &:disabled {
    cursor: auto;
    opacity: ${({ theme }) => theme.components.buttonIcon.disabledOpacity};
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
