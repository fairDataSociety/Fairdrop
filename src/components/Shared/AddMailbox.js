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

class AddMailbox extends Component{

  constructor(props) {
    super(props);
  }

  proxyHandleAddMailbox(e){
    e.preventDefault();
    this.props.handleAddMailbox();
  }

  render(){
    return (
      <div>
        <h2 className="select-account-header">Create mailbox</h2>
        <div className="mailbox-add-ui">
          <form onSubmit={this.proxyHandleAddMailbox.bind(this)}>
            <div className="form-group">
              <input
                className="mailbox-add-name"
                type="text"
                autoComplete="new-name"
                placeholder="Mailbox name"
                onChange={this.props.handleInputMailboxName}
                ref="dtSelectMailboxName"
              />
            </div>
            <div className="form-group">
              <input
                className="mailbox-add-password"
                type="password"
                placeholder="Password"
                autoComplete="off"
                onChange={this.props.handleInputPassword}
                ref="dtSelectPassword"
              />
            </div>
            <div className="form-group-last clearfix">
              <input
                autoComplete="off"
                className="mailbox-add-password-verification"
                type="password"
                placeholder="Verify password"
                onChange={this.props.handleInputPasswordVerification}
                ref="dtSelectPasswordVerification"
              />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default AddMailbox;
