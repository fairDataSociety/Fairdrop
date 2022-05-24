import React from 'react'
import { SwitchFileIcon } from './SwitchFileIcon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/SwitchFileIcon',
  component: SwitchFileIcon,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SwitchFileIcon {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  type: 'video/mp4',
}
