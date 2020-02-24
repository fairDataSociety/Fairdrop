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

import Settings from './content/Settings';
import AboutFairdrop from './content/AboutFairdrop';
import AboutFDS from './content/AboutFDS';
import Terms from './content/Terms';
import FAQ from './content/FAQ';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      isShown: false,
      screenIsShown: false,
      screenIsFadedIn: false,
      debouncingToggle: false
    };

  }

  debounceToggle(){
    if(this.state.debouncingToggle === true){
      return true;
    }
    this.setState({'debouncingToggle': true});
    setTimeout(()=>{
      this.setState({'debouncingToggle': false});
    }, 1000);
    return false;
  }


  toggleContent(force=null){
    if(this.state.isShown){
      //hide
      if(force === false){
        this.setState({
          isShown: false,
          screenIsFadedIn: false
        },()=>{
          setTimeout(()=>{
            this.setState({screenIsShown: false});
          }, 1000);
        });
      }
    }else{
      if(force === true){
        //show
        this.setState({
          isShown: true,
          screenIsShown: true
        },()=>{
          setTimeout(()=>{
            this.setState({screenIsFadedIn: true});
          }, 100);
        });
      }
    }
  }

  closeAll(){
    let promises = [
      this.refs.send.closeItem(true),
      this.refs.myFiles.closeItem(true),
      this.refs.settings.closeItem(true),
      this.refs.about.closeItem(true)
    ]
    return Promise.all(promises);
  }

  render(props){
    return <div className={'content-wrapper ' + (this.state.isShown ? 'contentShown ' : '') + (this.state.screenIsShown ? 'showScreen ' : '') + (this.state.screenIsFadedIn ? 'fadeInScreen ' : '')}>
      <div className={"content-background-screen"} onClick={this.toggleContent.bind(this)}></div>
      <div
        className={"content " + (this.state.isShown === false ? '' : 'show')}>
        <div className={(this.props.displayContent ? "content-shown" : "") +" content-body"}>
          {this.props.displayedContent === 'AboutFairdrop' &&
            <AboutFairdrop appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'AboutFDS' &&
            <AboutFDS appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'FAQ' &&
            <FAQ appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'Terms' &&
            <Terms appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'Settings' &&
            <div className="jsx-is-a-bag-of-balls">
              <Settings 
                appRoot={this.props.appRoot}
                savedAppState={this.props.savedAppState}
                saveAppState={this.props.saveAppState}
                selectedMailbox={this.props.selectedMailbox}
                selectedMailboxWarrantBalance={this.props.selectedMailboxWarrantBalance}
                toggleContent={this.props.toggleContent}
                initSentry={this.props.initSentry}
              />
            </div>
          }
        </div>
      </div>
    </div>
  }
}

export default App;
