import React from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { VARIANT } from '../../../theme/theme'
import { ButtonIcon } from './ButtonIcon'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ButtonIcon',
  component: ButtonIcon,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ButtonIcon icon={<FiChevronRight size="24px" color="#333333" />} {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  type: 'button',
  disabled: false,
  bordered: true,
  variant: {
    options: Object.values(VARIANT),
  },
}
