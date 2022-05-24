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

import Crypto from 'crypto'
import { Duration } from 'luxon'
// import zxcvbn from 'zxcvbn';

function generatePassword() {
  return new Promise((resolve) => {
    Crypto.randomBytes(48, function (err, buffer) {
      resolve(buffer.toString('hex'))
    })
  })
}

function humanFileSize(size) {
  if (typeof size === 'undefined') {
    return ' - '
  }
  var i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(0) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i]
}

function truncate(text, startChars, endChars, maxLength) {
  if (text.length > maxLength) {
    var start = text.substring(0, startChars)
    var end = text.substring(text.length - endChars, text.length)
    return start + '...' + end
  }
  return text
}

function formatBalance(wei) {
  return `xDAI ${(wei / 1000000000000000000).toFixed(2)}`
}

function copyToClipboard(text) {
  return new Promise((resolve) => {
    const fallback = () => {
      const textArea = document.createElement('textarea')
      textArea.value = text

      // Avoid scrolling to bottom
      textArea.style.top = '-10000px'
      textArea.style.left = '-10000px'
      textArea.style.position = 'fixed'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      resolve()
    }

    if (!navigator.clipboard) {
      return fallback()
    }

    return navigator.clipboard.writeText(text).then(resolve)
  })
}

function humanTime(seconds) {
  if (typeof seconds === 'undefined') {
    return ' - '
  }
  return Duration.fromObject({ seconds })
}

const honestInboxRegex = /anonymous-\d{13}/gm
function isAnonymousMessage(message) {
  return new RegExp(honestInboxRegex).test(message.from)
}

export default {
  generatePassword,
  humanFileSize,
  truncate,
  formatBalance,
  copyToClipboard,
  humanTime,
  isAnonymousMessage,
}
