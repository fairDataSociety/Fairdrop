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