import React from 'react'
import { ListItem } from './ListItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/ListItem',
  component: ListItem,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ListItem {...args} />

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  iconName: 'picture',
  title: 'Hello Worlds',
  subtitle: 'I am a subtitle',
  options: [],
}

export const LargeText = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
LargeText.args = {
  iconName: 'music',
  title:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
  subtitle: 'when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  options: [],
}
