import React from 'react'
import { CircleLoadingProgress } from './CircleLoadingProgress'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/CircleLoadingProgress',
  component: CircleLoadingProgress,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <CircleLoadingProgress {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {}
