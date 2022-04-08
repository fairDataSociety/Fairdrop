import React from 'react'
import { Box } from '../../atoms/box/Box'
import { Text } from '../../atoms/text/Text'
import { Slideshow } from './Slideshow'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Slideshow',
  component: Slideshow,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    indicatorsPosition: {
      options: ['left', 'center', 'right'],
    },
  },
  args: {
    indicatorsPosition: {
      options: ['left', 'center', 'right'],
    },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Slideshow {...args}>
    <Box direction="column">
      <Text size="l" weight="600" variant="black">
        Slide 1
      </Text>
      <Text size="m" variant="black">
        No central server · No tracking · No backdoors
      </Text>
    </Box>

    <Box direction="column">
      <Text size="l" weight="600" variant="black">
        Slide 2
      </Text>
      <Text size="m" variant="black">
        Receive any file anonimously. The perfect tool for censorship-resistant and free journalism
      </Text>
    </Box>

    <Box direction="column">
      <Text size="l" weight="600" variant="black">
        Slide 3
      </Text>
      <Text size="m" variant="black">
        End to end encrypted transfers
      </Text>
    </Box>
  </Slideshow>
)

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  initialIndex: 0,
  displayIndicators: true,
  autoPlay: true,
  interval: 5000,
}
