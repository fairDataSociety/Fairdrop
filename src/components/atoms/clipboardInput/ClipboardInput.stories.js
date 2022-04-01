import React from 'react'
import { ClipboardInput } from './ClipboardInput'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ClipboardInput',
  component: ClipboardInput,
  args: {
    copyText: 'Copy link',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ClipboardInput {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  value: 'To copy text',
}
