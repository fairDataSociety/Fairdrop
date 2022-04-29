import React, { useMemo } from 'react'
import { Box, Button, Slideshow, Text } from '../../../../components'
import styled from 'styled-components/macro'
import { useMediaQuery } from '../../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../../theme/theme'

const CarouselItem = styled(Box)`
  width: 100%;
`

const ActionButton = styled(Button)`
  margin-top: 8px;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    align-self: center;
  }
`

const StyledSlideshow = styled(Slideshow)`
  width: 100%;
`

const StyledText = styled(Text)`
  width: 100%;
`

const Carousel = (props) => {
  const maxTabletMediaQuery = useMediaQuery(`(max-width: ${DEVICE_SIZE.TABLET})`)

  const headlineSize = useMemo(() => {
    return maxTabletMediaQuery ? 'xl' : 'xxl'
  }, [maxTabletMediaQuery])

  const descriptionSize = useMemo(() => {
    return maxTabletMediaQuery ? 'ml' : 'xl'
  }, [maxTabletMediaQuery])

  const align = useMemo(() => {
    return maxTabletMediaQuery ? 'center' : 'left'
  }, [maxTabletMediaQuery])

  const indicatorsPosition = useMemo(() => {
    return maxTabletMediaQuery ? 'center' : 'left'
  }, [maxTabletMediaQuery])

  return (
    <StyledSlideshow interval={10000} indicatorsPosition={indicatorsPosition} {...props}>
      <CarouselItem gap="16px" direction="column">
        <StyledText size={headlineSize} weight="600" variant="white" align={align}>
          An easy and secure way to send your files
        </StyledText>
        <StyledText size={descriptionSize} variant="white" weight="300" align={align}>
          No central server · No tracking · No backdoors
        </StyledText>
      </CarouselItem>

      <CarouselItem gap="16px" direction="column">
        <StyledText size={headlineSize} weight="600" variant="white" align={align}>
          My honest inbox
        </StyledText>
        <StyledText size={descriptionSize} variant="white" weight="300" align={align}>
          Receive any file anonimously. The perfect tool for censorship-resistant and free journalism
        </StyledText>

        <ActionButton variant="white">View my honest inbox</ActionButton>
      </CarouselItem>
    </StyledSlideshow>
  )
}

export default React.memo(Carousel)
