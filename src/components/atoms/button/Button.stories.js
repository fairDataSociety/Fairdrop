import React from 'react'
import { VARIANT } from '../../../theme/theme'
import { Button } from './Button'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
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
    bordered: false,
    variant: {
      options: Object.values(VARIANT),
    },
    children: 'Action',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args} />

export const Solid = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Solid.args = {
  variant: 'primary',
}

export const Bordered = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Bordered.args = {
  bordered: true,
}

export const Disabled = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Disabled.args = {
  disabled: true,
  variant: 'primary',
}
