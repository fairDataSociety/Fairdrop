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

import React from 'react'
import styled, { css, keyframes } from 'styled-components/macro'

const loader = keyframes`
  0% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(180deg);
  }
  60% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const secondLoader = keyframes`
  0% {
    transform: translate3d(0, -32px, 0) scale(0, 2);
    opacity: 0;
  }
  50% {
    transform: translate3d(0, 0, 0) scale(1.25, 1.25);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 8px, 0) scale(0, 0);
    opacity: 0;
  }
`

const Bullet = styled.span`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  height: 32px;
  width: 32px;
  box-sizing: border-box;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    height: 32px;
    width: 32px;
    border: 3px solid #fff;
    border-bottom: 3px solid transparent;
    border-radius: 50%;
    -webkit-animation: ${loader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
    animation: ${loader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
    box-sizing: border-box;

    ${({ theme, variant }) => css`
      border-color: ${theme?.colors?.[variant]?.main};
      border-bottom-color: transparent;
    `}
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    -webkit-animation: ${secondLoader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
    animation: ${secondLoader} 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
    box-sizing: border-box;
    background: ${({ theme, variant }) => theme?.colors?.[variant]?.main};
  }
`

const Container = styled.div`
  display: block;
  height: 32px;
  width: 32px;
  position: relative;
`

export const CircleLoader = React.memo(({ className, variant = 'white' }) => {
  return (
    <Container className={className} variant={variant}>
      <Bullet variant={variant} />
    </Container>
  )
})

CircleLoader.displayName = 'CircleLoader'
