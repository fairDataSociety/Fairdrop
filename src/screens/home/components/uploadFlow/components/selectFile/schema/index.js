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

import * as yup from 'yup'
import { FILE_UPLOAD_TYPES } from '../../../../../../../hooks/fileManager/useFileManager'
import { FDSInstance } from '../../../../../../../hooks/mailbox/useMailbox'

let timeoutId = null
let pendingPromise = null

export const schema = yup.object().shape({
  type: yup.string().oneOf([FILE_UPLOAD_TYPES.QUICK, FILE_UPLOAD_TYPES.ENCRYPTED]),
  file: yup.mixed().required(),
  recipient: yup.string().test('mailboxAvailability', "This mailbox doesn't exist. Type another!", (value) => {
    return new Promise((resolve) => {
      pendingPromise?.(true)
      clearTimeout(timeoutId)
      pendingPromise = resolve
      timeoutId = setTimeout(() => {
        if (!value) {
          return resolve(false)
        }
        FDSInstance.Account.isMailboxNameAvailable(value)
          .then((result) => {
            return resolve(!result)
          })
          .catch(() => {
            resolve(false)
          })
      }, 400)
    })
  }),
})
