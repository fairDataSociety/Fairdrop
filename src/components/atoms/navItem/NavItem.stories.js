import React from 'react'
import { NavItem } from './NavItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Navigation/NavItem',
  component: NavItem,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <NavItem {...args} />

export const Active = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Active.args = {
  children: 'Page 1',
  active: true,
}

export const Inactive = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Inactive.args = {
  children: 'Page 2',
  active: false,
}
