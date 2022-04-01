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

import React, { useCallback, useEffect, useState } from 'react'
import Text from '../../../components/atoms/text/Text'
import { colors } from '../../../config/colors'
import { useTheme } from '../../../hooks/theme/useTheme'
import styles from './RegisterScreen.module.css'
import { useFormik } from 'formik'
import { Input } from '../../../components/atoms/input/Input'
import Button from '../../../components/atoms/button/Button'
import TouchableOpacity from '../../../components/atoms/touchableOpacity/TouchableOpacity'
import { schema } from './schema'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import Loader from '../../../components/atoms/loader/Loader'
import { routes } from '../../../config/routes'
import { toast } from 'react-toastify'

const RegisterScreen = ({ history, location }) => {
  const { setVariant, setBackground } = useTheme()
  const [, { createMailbox }] = useMailbox()
  const [infoMessage, setInfoMessage] = useState()
  const formik = useFormik({
    initialValues: {
      mailbox: '',
      password: '',
      passwordConfirmation: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await createMailbox({
          mailbox: values.mailbox,
          password: values.password,
          callback: (message) => setInfoMessage(message),
        })
        // setInfoMessage('Creating warrant')
        // await createWarrant()

        if (location?.state?.from) {
          history.replace(location?.state?.from)
        } else {
          history.replace(routes.upload.home)
        }
      } catch {
        toast.error('🔥 Something went wrong while trying to create your mailbox :(')
      }
    },
  })

  const handleGoBack = useCallback(() => {
    history.goBack()
  }, [history])

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
      <form className={styles.content} onSubmit={formik.handleSubmit} autoComplete="off">
        <Text className={styles.headline} element="h1" size="l" variant="black" weight="500" align="center">
          Create a new mailbox
        </Text>

        <Input
          name="mailbox"
          value={formik.values.mailbox}
          placeholder="Mailbox name"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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

        <span className={styles.decorator} />

        <Input
          name="passwordConfirmation"
          value={formik.values.passwordConfirmation}
          placeholder="Verify password"
          type="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        {getError() && (
          <Text className={styles.error} align="right" variant="black">
            {getError()}
          </Text>
        )}

        {infoMessage && (
          <Text className={styles.error} align="right" variant="black">
            {infoMessage}
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
            {formik.isValidating || formik.isSubmitting ? <Loader /> : 'Add mailbox'}
          </Button>

          <TouchableOpacity onClick={handleGoBack}>
            <Text variant="black">Go back</Text>
          </TouchableOpacity>
        </div>
      </form>
    </div>
  )
}

export default React.memo(RegisterScreen)
