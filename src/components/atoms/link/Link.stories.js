import React from 'react'
import { Link } from './Link'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Link',
  component: Link,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Link {...args} />

export const Active = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Active.args = {
  children: 'Link active',
  isActive: true,
}

export const Inactive = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Inactive.args = {
  children: 'Link Inactive',
  isActive: false,
}
