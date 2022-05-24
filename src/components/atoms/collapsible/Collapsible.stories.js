import React, { useState } from 'react'
import { Collapsible } from './Collapsible'
import { Button } from '../button/Button'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Collapsible',
  component: Collapsible,
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  const [show, setShow] = useState(false)
  const handleShow = () => {
    setShow(!show)
  }
  return (
    <div>
      <Button onClick={handleShow}>{show ? 'Hidde' : 'Show'}</Button>
      <Collapsible expanded={show}>{args.children}</Collapsible>
    </div>
  )
}

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  children:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
}

export const ShortText = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ShortText.args = {
  children: 'Lorem Ipsum is simply',
}

export const LargeText = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
LargeText.args = {
  children: (
    <>
      <p style={{ margin: '50px 0' }}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry
        standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
        a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </p>
      <p>
        The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
        1.10.32 and 1.10.33 from de Finibus Bonorum et Malorum by Cicero are also reproduced in their exact original
        form, accompanied by English versions from the 1914 translation by H. Rackham.
      </p>
    </>
  ),
}
