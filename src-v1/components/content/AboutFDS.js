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
import {notificationPermission} from '../../lib/FDSNotify.js'

class AboutFDS extends Component{

  constructor(props){
    super(props);
    
    this.state = {
      timesHasClicked: 0
    }

    this.enableEgg = this.enableEgg.bind(this);
  }

  enableEgg(){
    if(this.state.timesHasClicked < 10){
      this.setState({
        timesHasClicked: this.state.timesHasClicked + 1
      });
    }else{
      notificationPermission();
      localStorage.setItem('hasEnabledEasterEgg', true);
      alert('Max file size set to 500mb!');
    }
  }  

  render(){
    return (
      <div className="content-outer content-fds">
        <div className="content-inner">
          <div className="content-header">
            <img alt="FDS Logo" src={this.props.appRoot+"/assets/images/fair-data-society.svg"} onClick={this.enableEgg}/>
          </div>
          <div className="content-text">
            <p>
              Imagine a society of a completely private digital life where your privacy is not weaponised against you just to sell you more things.
            </p>

            <p>
              Fair Data Society is a non-profit initiative that is reimagining the data economy and creating a fair and decentralised data layer.
            </p>

            <p>
              We have Fair Trade, now why not Fair Data?
            </p>

            <p>
              Fair Data Society recognises online privacy as a <a rel="noopener noreferrer" target="_blank" href="https://en.wikipedia.org/wiki/Right_to_privacy">basic human right</a> and a basis for progress for all.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default AboutFDS;
