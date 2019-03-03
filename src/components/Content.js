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
        <div className={(this.props.displayContent ? "content-shown" : "") +" content-body"}>
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
      </div>
    </div>
  }
}

export default App;