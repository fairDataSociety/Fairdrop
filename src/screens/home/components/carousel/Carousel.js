import React from 'react'
import { Box, Button, Slideshow, Text } from '../../../../components'
import styled from 'styled-components/macro'

const CarouselItem = styled(Box)`
  width: 100%;
`

const ActionButton = styled(Button)`
  margin-top: 8px;
`

const Carousel = (props) => {
  return (
    <Slideshow interval={10000} {...props}>
      <CarouselItem gap="16px" direction="column">
        <Text size="xxl" weight="600" variant="white">
          An easy and secure way to send your files
        </Text>
        <Text size="xl" variant="white">
          No central server · No tracking · No backdoors
        </Text>
      </CarouselItem>

      <CarouselItem gap="16px" direction="column">
        <Text size="xxl" weight="600" variant="white">
          My honest inbox
        </Text>
        <Text size="xl" variant="white" weight="300">
          Receive any file anonimously. The perfect tool for censorship-resistant and free journalism
        </Text>

        <ActionButton variant="white">View my honest inbox</ActionButton>
      </CarouselItem>
    </Slideshow>
  )
}

export default React.memo(Carousel)
