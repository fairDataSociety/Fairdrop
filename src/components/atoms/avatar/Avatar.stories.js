import React from 'react'
import AvatarImg from './avatar.png'

import { Avatar } from './Avatar'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Avatar',
  component: Avatar,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Avatar {...args} />

export const withNameAndImage = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withNameAndImage.args = {
  name: 'Pau',
  src: AvatarImg,
}

export const withoutName = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withoutName.args = {
  name: undefined,
  src: AvatarImg,
}

export const withoutImage = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withoutImage.args = {
  name: 'Pau',
  src: undefined,
}
