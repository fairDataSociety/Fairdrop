import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import DMailbox from '../../services/DMailbox';

import Dropzone from 'dropzone';

import MailboxIcon from '../up/CSelectMailbox/MailboxIcon'
import AddMailbox from '../up/CSelectMailbox/AddMailbox'
import UnlockMailbox from '../up/CSelectMailbox/UnlockMailbox'

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-select-recipient" className={"dt-select-recipient dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 3 ? "dt-fade-in" : "")}> 
        <div className="dt-select-recipient-ui dt-page-inner-centered">
          <div className="dt-select-recipient">
            <h1 className="dt-select-account-header">Select Recipient</h1>
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile;