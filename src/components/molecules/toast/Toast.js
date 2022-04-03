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

import { memo } from 'react'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components/macro'

export const Toast = memo(styled(ToastContainer)`
  &&&.Toastify__toast-container {
    bottom: 0;
    left: 0;
    right: 0;
    transform: unset;
    padding: 0;
    width: 100%;
  }
  .Toastify__toast {
    margin: 0;
    border-radius: 0;
    min-height: 48px;
    padding: 14px;
    box-shadow: none;
  }
  .Toastify__toast-body {
    padding: 0;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    justify-content: center;
  }
`)
