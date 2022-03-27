import React from 'react'
import { Nav } from './Nav'
import { NavItem } from '../navItem/NavItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Navigation/Nav',
  component: Nav,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  return (
    <Nav {...args}>
      <NavItem active>Home</NavItem>
      <NavItem>About</NavItem>
      <NavItem>Dashboard</NavItem>
    </Nav>
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = { vertical: false }
