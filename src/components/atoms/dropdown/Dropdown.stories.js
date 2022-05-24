import React from 'react'
import { Dropdown } from './Dropdown'
import { DropdownOption } from '../dropdownOption/DropdownOption'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Dropdown',
  component: Dropdown,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  return (
    <>
      <Dropdown {...args}>
        <DropdownOption onClick={() => console.log('Click 1')}>Action 1</DropdownOption>
        <DropdownOption onClick={() => console.log('Click 2')}>Action 2</DropdownOption>
      </Dropdown>
      <h1>More contente....</h1>
    </>
  )
}

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  id: 'dropdown',
  align: 'right',
}
