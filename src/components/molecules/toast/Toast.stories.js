import React, { useEffect } from 'react'
import { toast, Slide } from 'react-toastify'
import { Toast } from './Toast'
import 'react-toastify/dist/ReactToastify.css'

const OPTIONS = ['success', 'warning', 'error']

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Toast',
  component: Toast,
  argTypes: {
    type: {
      options: OPTIONS,
    },
  },
  args: {
    type: {
      options: OPTIONS,
    },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  const toastId = React.useRef(null)

  useEffect(() => {
    toast.dismiss(toastId.current)
    setTimeout(() => {
      toastId.current = toast('🤷‍♂️ There is no mailboxes to export', { type: args?.type })
    }, 300)
  }, [args])

  return (
    <Toast
      position="bottom-center"
      closeButton={false}
      draggableDirection="y"
      transition={Slide}
      icon={false}
      theme="colored"
      {...args}
    />
  )
}

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  autoClose: false,
}
