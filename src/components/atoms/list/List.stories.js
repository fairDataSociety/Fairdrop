import React from 'react'
import { List } from './List'
import { ListItem } from '../listItem/ListItem'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/List',
  component: List,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <List {...args}>
    <ListItem iconName="picture" title="Picture title" subtitle="Item Subtitle" />
    <ListItem iconName="music" title="Music title" subtitle="Item Subtitle" />
    <ListItem iconName="video" title="Video title" subtitle="Item Subtitle" />
  </List>
)

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {}
