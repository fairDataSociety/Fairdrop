import React from 'react'
import { DropArea } from './DropArea'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/DropArea',
  component: DropArea,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    icon: 'folder',
    headline: 'This is a headline',
    description: 'Drop your file here',
    onDrop: (files) => console.info(files),
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <DropArea {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {}
