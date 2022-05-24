import React from 'react'
import { SidebarLink } from './SidebarLink'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/SidebarLink',
  component: SidebarLink,
  args: {
    count: 0,
    to: '/fake-path',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SidebarLink {...args} />

export const Regular = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Regular.args = {
  children: 'Sidebar link',
  isActive: true,
}

export const Pending = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Pending.args = {
  children: 'Sidebar link',
  count: 10,
  isActive: false,
}
