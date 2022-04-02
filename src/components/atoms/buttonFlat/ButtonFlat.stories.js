import React from 'react'
import { ButtonFlat } from './ButtonFlat'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ButtonFlat',
  component: ButtonFlat,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ButtonFlat {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  variant: 'primary',
  children: 'Action',
}
