import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import 'bootstrap/dist/css/bootstrap.css'
import App from './App';


let bzz = window.location.href.split('/')[window.location.href.split('/').length-2]

let basename = process.env.NODE_ENV === 'production' ? `/bzz:/${bzz}` : `/`;

console.log(process.env.NODE_ENV, basename)

ReactDOM.render(<Router basename={basename}><App /></Router>, document.getElementById('root'));