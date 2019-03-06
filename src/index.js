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

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.css'

import App from './App';

import {version} from '../package.json';

console.log(`Fairdrop Version ${version} - Created by FDS`);

//enables us to use subdirectory base urls with react router
let bzz = window.location.href.split('/')[window.location.href.split('/').length-2]
let appRoot = window.location.href.match('bzz:') !== null  ? window.location.href.split('/').slice(0,5).join('/') : '';
console.log(appRoot);
ReactDOM.render(<Router basename={appRoot}><App appRoot={appRoot}/></Router>, document.getElementById('root'));
