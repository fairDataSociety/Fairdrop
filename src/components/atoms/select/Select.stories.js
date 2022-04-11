import React, { useState } from 'react'
import { Select } from './Select'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Select',
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'test-select',
    name: 'test',
    type: 'text',
    disabled: false,
    label: 'Label',
    placeholder: 'Placeholder',
    hasError: false,
    errorMessage: '',
    options: [
      {
        label: 'Option 1',
        value: 1,
      },
      {
        label: 'Option 2',
        value: 2,
      },
      {
        label: 'Option 3',
        value: 3,
      },
      {
        label: 'Option 4',
        value: 4,
      },
    ],
    onChange: (evt) => console.info(evt),
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = ({ onChange, ...args }) => {
  const [selectedOption, setSelectedOption] = useState()

  const handleChange = (option) => {
    setSelectedOption(option.value)
    onChange?.(option)
  }

  return <Select selectedOption={selectedOption} onChange={handleChange} {...args} />
}

export const Simple = Template.bind({})

export const WithError = Template.bind({})
WithError.args = {
  hasError: true,
  errorMessage: 'Custom error message',
}
