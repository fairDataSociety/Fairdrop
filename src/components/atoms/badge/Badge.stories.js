import React from 'react'
import { Badge } from './Badge'
import { FaEnvelope } from 'react-icons/fa'
import { VARIANT } from '../../../theme/theme'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Badge',
  component: Badge,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      options: Object.values(VARIANT),
    },
  },
  args: {
    showZero: false,
    inline: false,
    variant: {
      options: Object.values(VARIANT),
    },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Badge {...args}>
    <FaEnvelope size="24px" color="#333333" />
  </Badge>
)

export const Zero = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Zero.args = {
  count: 0,
}

export const NonZero = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
NonZero.args = {
  count: 10,
}
