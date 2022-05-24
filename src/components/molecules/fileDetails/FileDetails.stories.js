import { DateTime } from 'luxon'
import React from 'react'
import { FileDetails } from './FileDetails'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/FileDetails',
  component: FileDetails,
  args: {
    file: {
      name: 'andrey-haimin-q2Fyzn-Klkdfkljasdckmsc.mp3',
      type: 'audio/mp3',
      size: 420006,
    },
    account: 'mancas',
    when: DateTime.now().toMillis(),
    link: 'https://gateway.fairdrop.eth#blablabla',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <FileDetails {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  variant: 'primary',
}
