import React from 'react'
import { Icon } from './Icon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Icon',
  component: Icon,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Icon {...args} />

export const IconElement = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
IconElement.args = {
  name: 'file',
  size: 'm',
}
