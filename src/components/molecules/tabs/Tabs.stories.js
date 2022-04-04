import React from 'react'
import { Tab } from '../../atoms/tab/Tab'
import { Tabs } from './Tabs'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Tabs',
  component: Tabs,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = ({ tabs, ...args }) => (
  <Tabs {...args}>
    {tabs.map(({ label }) => {
      return <Tab key={label}>{label}</Tab>
    })}

    {tabs.map(({ label, content: Content }) => {
      return React.cloneElement(Content, { key: label })
    })}
  </Tabs>
)

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  tabs: [
    { label: 'My tab 1', content: <div>Content 1</div> },
    { label: 'My tab 2 super long', content: <div>Content 2</div> },
  ],
}
