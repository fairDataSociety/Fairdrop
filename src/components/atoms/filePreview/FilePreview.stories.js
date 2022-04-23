import React from 'react'
import { FilePreview } from './FilePreview'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/FilePreview',
  component: FilePreview,
  args: {
    file: {
      type: 'image/png',
    },
    link: 'https://images.unsplash.com/photo-1648567451040-f7cd2c60fd35?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1808&q=80',
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <FilePreview {...args} />

export const Picture = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Picture.args = {}

export const Audio = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Audio.args = {
  file: {
    type: 'audio/mp3',
  },
}

export const Video = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Video.args = {
  file: {
    type: 'video/mp4',
  },
}

export const Document = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Document.args = {
  file: {
    type: 'text/plain',
  },
}
