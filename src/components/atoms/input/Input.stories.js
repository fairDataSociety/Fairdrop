import React from 'react'
import { FiCheck } from 'react-icons/fi'
import { Input } from './Input'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Input',
  component: Input,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'test-input',
    name: 'test',
    type: 'text',
    disabled: false,
    label: 'Label',
    placeholder: 'Placeholder',
    hasError: false,
    errorMessage: '',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Input {...args} />

export const Simple = Template.bind({})

export const WithError = Template.bind({})
WithError.args = {
  hasError: true,
  errorMessage: 'Custom error message',
}

export const WithIcon = Template.bind({})
WithIcon.args = {
  icon: <FiCheck size="24px" color="green" />,
}
