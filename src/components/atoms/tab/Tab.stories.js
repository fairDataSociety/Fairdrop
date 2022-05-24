import React from 'react'
import { Tab } from './Tab'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Tab',
  component: Tab,
  args: {
    children: 'My tab',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Tab {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  isActive: false,
}
