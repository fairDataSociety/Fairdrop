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
import Dropdown from 'react-dropdown';

class UnlockMailbox extends Component{

  proxyUnlockMailbox(e){
    e.preventDefault();
    this.props.unlockMailbox();
  }

  render(){
    return (
      <div className="mailbox-unlock-ui">
        <h2 className="select-account-header">Select mailbox</h2>
        <div className="form-group clearfix">
          <div className="select-mailbox-mailboxes">
            <Dropdown
              options={this.props.dropDownOptions}
              value={this.props.dropDownValue}
              onChange={this.props.handleSelectMailbox}
              placeholder="Select a mailbox"
            />
          </div>
        </div>
        <div className="form-group form-group-last clearfix">
            <form onSubmit={this.proxyUnlockMailbox.bind(this)}>
              <input
                id="mailbox-unlock-password"
                autoComplete="off"
                className="mailbox-unlock-password"
                type="password"
                placeholder="Password"
                ref="dtSelectPassword"
                onChange={this.props.handleInputPassword.bind(this)}
              />
            </form>
        </div>
      </div>
    )
  }
}

export default UnlockMailbox;
