import React, { Component } from 'react';
import MenuItem from './MenuItem';

import AboutFairdrop from './content/AboutFairdrop';
import AboutFDS from './content/AboutFDS';
import Terms from './content/Terms';

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
        <div className={this.props.displayContent +" content-body"}>
          {this.props.displayedContent === 'AboutFairdrop' &&
            <AboutFairdrop appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'AboutFDS' &&
            <AboutFDS appRoot={this.props.appRoot} />
          }
          {this.props.displayedContent === 'Terms' &&
            <Terms appRoot={this.props.appRoot} />
          }
        </div>
        <div className="menu-footer">
          <div class="menu-footer-item"><a target="_blank" href="https://github.com/fairDataSociety"><img src={this.props.appRoot + "/assets/images/github-logo.svg"}/></a></div>        
          <div class="menu-footer-item"><a target="_blank" href="https://twitter.com/DataFundProject"><img src={this.props.appRoot + "/assets/images/twitter-logo.svg"}/></a></div>
          <div class="menu-footer-item"><a target="_blank" href="https://gitter.im/fairdatasociety/community"><img src={this.props.appRoot + "/assets/images/gitter-logo.svg"}/></a></div>
          <div class="menu-footer-item"><a target="_blank" href="https://datafund.io"><img src={this.props.appRoot + "/assets/images/datafund-footer-logo.svg"}/></a></div>
          <div class="menu-footer-item"><a target="_blank" href="https://riot.im/app/#/room/#fairdatasociety:matrix.org"><img src={this.props.appRoot + "/assets/images/riot-logo.svg"}/></a></div>          
        </div>
      </div>
    </div>
  }
}

export default App;