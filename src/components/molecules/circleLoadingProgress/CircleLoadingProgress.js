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

import { memo } from 'react'
import styled, { keyframes } from 'styled-components/macro'

const circular = keyframes`
  0% {
      transform: rotate(0deg);
  }
  12.5% {
      transform: rotate(180deg);
      animation-timing-function: linear;
  }
  25% {
      transform: rotate(630deg);
  }
  37.5% {
      transform: rotate(810deg);
      animation-timing-function: linear;
  }
  50% {
      transform: rotate(1260deg);
  }
  62.5% {
      transform: rotate(1440deg);
      animation-timing-function: linear;
  }
  75% {
      transform: rotate(1890deg);
  }
  87.5% {
      transform: rotate(2070deg);
      animation-timing-function: linear;
  }
  100% {
      transform: rotate(2520deg);
  }
`

const circularPseudo = keyframes`
  0% {
      transform: rotate(-30deg);
  }
  29.4% {
      border-left-color: transparent;
  }
  29.41% {
      border-left-color: currentColor;
  }
  64.7% {
      border-bottom-color: transparent;
  }
  64.71% {
      border-bottom-color: currentColor;
  }
  100% {
      border-left-color: currentColor;
      border-bottom-color: currentColor;
      transform: rotate(225deg);
  }
`

export const CircleLoadingProgress = memo(styled.progress`
  appearance: none;
  box-sizing: border-box;
  border: none;
  border-radius: 50%;
  padding: 0.25em;
  width: 3em;
  height: 3em;
  color: ${({ theme }) => theme?.colors?.primary?.main};
  background-color: transparent;
  font-size: 16px;
  overflow: hidden;

  &::-webkit-progress-bar {
    background-color: transparent;
  }

  &:indeterminate {
    mask-image: linear-gradient(transparent 50%, black 50%), linear-gradient(to right, transparent 50%, black 50%);
    animation: ${circular} 6s infinite cubic-bezier(0.3, 0.6, 1, 1);
  }

  :-ms-lang(x),
  & {
    animation: none;
  }

  &:indeterminate::before,
  &:indeterminate::-webkit-progress-value {
    content: '';
    display: block;
    box-sizing: border-box;
    margin-bottom: 0.25em;
    border: solid 0.25em transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    width: 100% !important;
    height: 100%;
    background-color: transparent;
    animation: ${circularPseudo} 0.75s infinite linear alternate;
  }

  &:indeterminate::-moz-progress-bar {
    box-sizing: border-box;
    border: solid 0.25em transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    background-color: transparent;
    animation: ${circularPseudo} 0.75s infinite linear alternate;
  }

  &:indeterminate::-ms-fill {
    animation-name: -ms-ring;
  }
`)
