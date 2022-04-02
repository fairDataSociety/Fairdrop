import React from 'react'
import { Box } from './Box'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Box',
  component: Box,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Box {...args} style={{ border: 'solid 1px #000', width: '400px', height: '400px' }}>
    <div style={{ width: '40px', height: '40px', background: 'green' }} />
    <div style={{ width: '60px', height: '60px', background: 'blue' }} />
    <div style={{ width: '30px', height: '30px', background: 'red' }} />
  </Box>
)

export const Example = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Example.args = {
  gap: '24px',
  direction: 'row',
  vAlign: 'center',
  hAlign: 'center',
  margin: '20px',
  padding: '20px',
}
