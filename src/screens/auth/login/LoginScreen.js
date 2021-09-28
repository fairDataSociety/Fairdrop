// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useEffect } from 'react'
import Text from '../../../components/atoms/text/Text'
import { colors } from '../../../config/colors'
import { useTheme } from '../../../hooks/theme/useTheme'
import styles from './LoginScreen.module.css'
import Select from '../../../components/atoms/select/Select'
import { routes } from '../../../config/routes'
import { useFormik } from 'formik'
import Input from '../../../components/atoms/input/Input'
import Button from '../../../components/atoms/button/Button'
import TouchableOpacity from '../../../components/atoms/touchableOpacity/TouchableOpacity'
import { schema } from './schema'

const NEW_MAILBOX = 'NEW_MAILBOX'

const LoginScreen = ({ history }) => {
  const { setVariant, setBackground } = useTheme()
  const formik = useFormik({
    initialValues: {
      mailbox: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: (values) => {
      console.info(values)
    },
  })

  const handleAddMailbox = useCallback(() => {
    history.push(routes.register)
  }, [history])

  const handleMailboxChange = useCallback(
    ({ value }) => {
      if (value === NEW_MAILBOX) {
        return handleAddMailbox()
      }

      formik.setFieldValue('mailbox', value)
    },
    [formik, handleAddMailbox],
  )

  useEffect(() => {
    setVariant('black')
    setBackground(colors.white)
  }, [])

  return (
    <div className={styles.container}>
      <form className={styles.content} onSubmit={formik.handleSubmit}>
        <Text className={styles.headline} element="h1" size="l" variant="black" weight="500" align="center">
          Login In
        </Text>

        <Select
          options={[
            { label: 'testr', value: 'mytest-..' },
            { label: 'testr1', value: 'mytest-..1' },
            { label: 'new mailbox +', value: NEW_MAILBOX },
          ]}
          value={formik.values.mailbox}
          onChange={handleMailboxChange}
          placeholder="Select a mailbox"
        />

        <span className={styles.decorator} />

        <Input
          name="password"
          value={formik.values.password}
          placeholder="Password"
          type="password"
          onChange={formik.handleChange}
        />

        <div className={styles.actions}>
          <Button
            variant="black"
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            Unlock mailbox
          </Button>

          <TouchableOpacity onClick={handleAddMailbox}>
            <Text variant="black">New mailbox +</Text>
          </TouchableOpacity>
        </div>
      </form>
    </div>
  )
}

export default React.memo(LoginScreen)
