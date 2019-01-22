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