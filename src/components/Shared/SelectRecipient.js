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

class SelectRecipient extends Component{

  constructor(props) {
    super(props);

    this.FDS = props.FDS;

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
    }

  }

  render(){
    return (
      <div className="select-recipient">
          <h2 className="select-account-header">Select recipient*</h2>
          <div className="form-group form-group-last">
            <input
              id="select-recipient-address"
              className="select-recipient-address"
              type="text"
              placeholder="mailbox name"
              onChange={this.props.handleSelectRecipient}
              name="selectRecipient"
              ref="dtSelectRecipient"
            />
            <div className="ui-feedback">{this.state.feedbackMessage}</div>
          </div>
      </div>
    )
  }
}

export default SelectRecipient;
