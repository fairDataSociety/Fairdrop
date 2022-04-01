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

import React, { useCallback } from 'react'
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './SelectRecipientStep.module.css'
import Button from '../../../../../components/atoms/button/Button'
import Text from '../../../../../components/atoms/text/Text'
import TouchableOpacity from '../../../../../components/atoms/touchableOpacity/TouchableOpacity'
import { useFormik } from 'formik'
import { schema } from './schema'
import { Input } from '../../../../../components/atoms/input/Input'
import Loader from '../../../../../components/atoms/loader/Loader'
import { useHistory } from 'react-router-dom'
import { routes } from '../../../../../config/routes'

const SelectRecipientStep = ({ nextStep }) => {
  const [, { setRecipient }] = useFileManager()
  const history = useHistory()

  const formik = useFormik({
    initialValues: {
      mailbox: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setRecipient?.({ recipient: values.mailbox })
      nextStep?.()
    },
  })

  const handleCancelClick = useCallback(() => {
    history.replace(routes.upload.home)
  }, [history])

  const getError = useCallback(() => {
    const keys = Object.keys(formik.touched)
    if (keys.length === 0) {
      return ''
    }
    const errorField = Object.keys(formik.errors).find((errorField) => !!formik.touched[errorField])
    return formik.errors[errorField]
  }, [formik.errors, formik.touched])

  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500">
        Select Recipient
      </Text>

      <form className={styles.content} onSubmit={formik.handleSubmit} autoComplete="off">
        <Input
          name="mailbox"
          value={formik.values.mailbox}
          placeholder="Recipient's mailbox name"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        {getError() && (
          <Text className={styles.error} align="right">
            {getError()}
          </Text>
        )}
      </form>

      <div className={styles.actions}>
        <Button variant="green" type="submit" onClick={formik.handleSubmit}>
          {formik.isValidating || formik.isSubmitting ? <Loader variant="green" /> : 'Continue'}
        </Button>

        <TouchableOpacity onClick={handleCancelClick}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </div>
    </div>
  )
}

export default React.memo(SelectRecipientStep)
