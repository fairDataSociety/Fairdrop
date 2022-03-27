import React from 'react'
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from './Table'

const sampleData = [
  {
    id: 1,
    a: 'Lorem ipsum',
    b: 23,
    c: Date.now(),
  },
  {
    id: 2,
    a: 'Lorem ipsum2',
    b: 23,
    c: Date.now(),
  },
  {
    id: 3,
    a: 'Lorem ipsum3',
    b: 23,
    c: Date.now(),
  },
  {
    id: 4,
    a: 'Lorem ipsum4',
    b: 23,
    c: Date.now(),
  },
]

const SampleTable = () => {
  return (
    <>
      <Table id="sample-table">
        <TableHead>
          <TableRow>
            <TableCell>Column 1</TableCell>
            <TableCell>Column 2</TableCell>
            <TableCell>Column 3</TableCell>
            <TableCell>Column 4</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sampleData?.map(({ id, a, b, c }) => {
            return (
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>{a}</TableCell>
                <TableCell>{b}</TableCell>
                <TableCell>{c}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <TablePagination count={sampleData.length} rowsPerPage={20} page={0} onPageChange={() => {}} />
    </>
  )
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Table',
  component: SampleTable,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SampleTable {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {}
