import React from 'react'
import { MetamaskButton } from './MetamaskButton'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MetamaskButton',
  component: MetamaskButton,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <MetamaskButton {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  disabled: false,
  onAccountsReady: ({ accounts }) => console.info(accounts),
}
