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

import { transparentize } from 'polished'
import React, {
  useState,
  useCallback,
  Children,
  useMemo,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { CSSTransition } from 'react-transition-group'
import { SwitchTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { Box } from '../../atoms/box/Box'

const Item = styled.section`
  transition: all 0.3s ease;

  &.slideshow-transition-enter {
    opacity: 0;
  }

  &.slideshow-transition-exit {
    opacity: 1;
  }

  &.slideshow-transition-enter-active {
    opacity: 1;
  }

  &.slideshow-transition-exit-active {
    opacity: 0;
  }
`

const Indicators = styled(Box)`
  width: 100%;
`

const Indicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme?.colors?.white?.main : transparentize(0.7, theme?.colors?.white?.main)};
`

export const Slideshow = forwardRef(
  (
    { initialIndex, onItemChange, children, displayIndicators, indicatorsPosition, autoPlay, interval, ...props },
    ref,
  ) => {
    const [activeIdx, setActiveIdx] = useState(initialIndex ?? 0)
    const intervalId = useRef()

    const numberOfItems = useMemo(() => {
      return Children.count(children) ?? 0
    }, [children])

    const handleNext = useCallback(() => {
      setActiveIdx((state) => {
        const newValue = state + 1
        if (newValue > numberOfItems - 1) {
          if (autoPlay) return 0
          return state
        }
        onItemChange?.(newValue)
        return newValue
      })
    }, [children, onItemChange, autoPlay])

    const handlePrev = useCallback(() => {
      setActiveIdx((state) => {
        const newValue = state - 1
        if (newValue < 0) {
          return state
        }
        onItemChange?.(newValue)
        return newValue
      })
    }, [onItemChange])

    useImperativeHandle(ref, () => ({
      next: handleNext,
      prev: handlePrev,
    }))

    useEffect(() => {
      if (!autoPlay) {
        clearInterval(intervalId.current)
        return () => clearInterval(intervalId.current)
      }

      intervalId.current = setInterval(() => {
        handleNext()
      }, interval)

      return () => clearInterval(intervalId.current)
    }, [autoPlay, interval, handleNext])

    return (
      <Box direction="column" {...props}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={activeIdx}
            addEndListener={(node, done) => {
              node.addEventListener('transitionend', done, false)
            }}
            classNames="slideshow-transition"
          >
            <Item>{Children.toArray(children)?.[activeIdx] ?? null}</Item>
          </CSSTransition>
        </SwitchTransition>

        {displayIndicators && (
          <Indicators hAlign={indicatorsPosition} margin="48px 0 0" gap="16px">
            {Children.map(children, (_, idx) => {
              return <Indicator key={`indicator-${idx}`} isActive={idx === activeIdx} />
            }) ?? null}
          </Indicators>
        )}
      </Box>
    )
  },
)

Slideshow.defaultProps = {
  initialIndex: 0,
  displayIndicators: true,
  indicatorsPosition: 'left',
  autoPlay: true,
  interval: 5000,
}

Slideshow.displayName = 'Slideshow'
