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

import React, { Component } from 'react';

class App extends Component {

  render(props){
    return <div
      className={"disclaimer " + (this.props.disclaimersAreShown === false ? 'hidden' : '')}
      >
      <div className="disclaimer-wrapper">
        <div className="disclaimer-content">
          FDS just upgraded. Mailboxes have been reset. You may export legacy mailboxes from Settings and use <a rel="noopener noreferrer" target="_blank" href="https://legacy.fairdrop.xyz">Legacy</a> for a short time only.<span className="click-to-dismiss" onClick={this.props.hideDisclaimer3}>(Dismiss)</span>
        </div>
      </div>
    </div>
  }
}

export default App;