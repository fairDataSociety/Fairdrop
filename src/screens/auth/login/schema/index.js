import * as yup from 'yup'

export const schema = yup.object().shape({
  mailbox: yup.string().required(),
  password: yup.string().required(),
})
