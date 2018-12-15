import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.css'

import App from './App';

import {version} from '../package.json';

console.log(`Fairdrop Version ${version} - Created by FDS`);

//enables us to use subdirectory base urls with react router
let bzz = window.location.href.split('/')[window.location.href.split('/').length-2]
let basename = process.env.NODE_ENV === 'production' ? `/bzz:/${bzz}` : `/`;

ReactDOM.render(<Router basename={basename}><App /></Router>, document.getElementById('root'));