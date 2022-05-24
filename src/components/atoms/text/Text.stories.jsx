import React from 'react'

import Text, { ALIGN, ELEMENTS, SIZES, TRANSFORM, VARIANTS } from './Text'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Text',
  component: Text,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      options: VARIANTS,
    },
    size: {
      options: SIZES,
    },
    as: {
      options: ELEMENTS,
    },
    align: {
      options: ALIGN,
    },
    transform: {
      options: TRANSFORM,
    },
    weight: {
      options: ['light', 'regular', 'medium', 'semibold', 'bold', 'black'],
    },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Text {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  weight: 'regular',
  children: 'Text',
  className: '',
}
