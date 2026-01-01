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
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';

import App from './App';

const version = '0.9.0';

// Error Boundary component for catching React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{color:'white',padding:'50px',background:'#5B8DEF',minHeight:'100vh'}}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log(`Fairdrop Version ${version}`);

// Enables us to use subdirectory base urls with react router
let appRoot = window.location.href.match('bzz:') !== null
  ? window.location.href.split('/').slice(0,5).join('/')
  : '';
let basename = window.location.href.match('bzz:') !== null
  ? window.location.href.split('/').slice(3,5).join('/')
  : '';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <Router basename={basename}>
      <App appRoot={appRoot}/>
    </Router>
  </ErrorBoundary>
);
