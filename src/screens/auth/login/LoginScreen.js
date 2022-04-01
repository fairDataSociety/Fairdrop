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

import React, { useCallback, useEffect, useMemo } from 'react'
import Text from '../../../components/atoms/text/Text'
import { colors } from '../../../config/colors'
import { useTheme } from '../../../hooks/theme/useTheme'
import styles from './LoginScreen.module.css'
import Select from '../../../components/atoms/select/Select'
import { routes } from '../../../config/routes'
import { useFormik } from 'formik'
import { Input } from '../../../components/atoms/input/Input'
import Button from '../../../components/atoms/button/Button'
import TouchableOpacity from '../../../components/atoms/touchableOpacity/TouchableOpacity'
import { schema } from './schema'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import Loader from '../../../components/atoms/loader/Loader'
import { toast } from 'react-toastify'

const NEW_MAILBOX = 'NEW_MAILBOX'

const LoginScreen = ({ history, location }) => {
  const { setVariant, setBackground } = useTheme()
  const [{ accounts }, { unlockMailbox }] = useMailbox()
  const formik = useFormik({
    initialValues: {
      mailbox: '',
      password: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await unlockMailbox(values)

        if (location?.state?.from) {
          history.replace(location?.state?.from)
        } else {
          history.replace(routes.upload.home)
        }
      } catch {
        toast.error('💩 We could not unlock your mailbox. Please check your mailbox name and password')
      }
    },
  })

  const options = useMemo(() => {
    const options = accounts.map((subdomain) => {
      return { label: subdomain, value: subdomain }
    })

    options.push({ label: 'new mailbox +', value: NEW_MAILBOX })

    return options
  }, [accounts])

  const handleAddMailbox = useCallback(() => {
    history.push(routes.register)
  }, [history])

  const handleMailboxChange = useCallback(
    ({ value }) => {
      if (value === NEW_MAILBOX) {
        return handleAddMailbox()
      }

      formik.setFieldTouched('mailbox', true)
      formik.setFieldValue('mailbox', value)
    },
    [formik, handleAddMailbox],
  )

  const getError = useCallback(() => {
    const keys = Object.keys(formik.touched)
    if (keys.length === 0) {
      return ''
    }
    const errorField = Object.keys(formik.errors).find((errorField) => !!formik.touched[errorField])
    return formik.errors[errorField]
  }, [formik.errors, formik.touched])

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
          options={options}
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
          onBlur={formik.handleBlur}
        />

        {getError() && (
          <Text className={styles.error} align="right" variant="black">
            {getError()}
          </Text>
        )}

        <div className={styles.actions}>
          <Button
            className={styles.submitButton}
            variant="black"
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {formik.isValidating || formik.isSubmitting ? <Loader /> : 'Unlock mailbox'}
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
