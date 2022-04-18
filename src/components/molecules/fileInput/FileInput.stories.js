import React, { useState } from 'react'
import { FileInput } from './FileInput'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/FileInput',
  component: FileInput,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onFileChange: (file) => console.info(file),
    onClean: () => console.info('Clean!'),
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = ({ onFileChange, onClean, ...args }) => {
  const [file, setFile] = useState()
  const handleFileChange = (file) => {
    setFile(file)
    onFileChange?.(file)
  }

  const handleClean = () => {
    setFile()
    onClean?.()
  }

  return <FileInput file={file} onFileChange={handleFileChange} onClean={handleClean} {...args} />
}

export const Sample = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Sample.args = {
  disabled: false,
}
