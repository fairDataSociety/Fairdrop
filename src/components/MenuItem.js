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

  constructor(props){
    super(props);

    this.state = {
      linksAreShown: false
    };

  }

  toggleItem(){
    this.props.closeAll().then(()=>{
      this.setState({linksAreShown: !this.state.linksAreShown});
    });
  }

  closeItem(){
    return new Promise((resolve, reject) => {
      this.setState({linksAreShown: false}, resolve);
    })
  }

  handleClick(funct){
    this.props.toggleMenu();
    funct();
  }

  render(props){
    return <div className={"menu-section " + (this.state.linksAreShown ? "show-links" : "")}>
            <div
              className="menu-item-header"
              onClick={this.toggleItem.bind(this)}
              handleNavigateTo={this.props.handleNavigateTo}
            >
                {this.props.header}
            </div>
            <div className="menu-links">
              { this.props.items.map((item)=>{
                  return <div class="menu-link" onClick={()=>this.handleClick(item[1])}>{item[0]}</div>
                })
              }
            </div>
          </div>
  }
}

export default App;
