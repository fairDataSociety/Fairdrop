import React, { Component } from 'react';

class App extends Component {

  constructor(props) {
    super(props);

    let loc;
    if(this.props.isList === true){
      loc = this.props.routerArgs.location.pathname.replace('download-list/','bzz-list:/')      
    }else{
      loc = this.props.routerArgs.location.pathname.replace('download/','bzz:/');
    }

    let secs = this.props.routerArgs.location.pathname.split('/');
    let fn = secs[secs.length-1].replace(/\?(.*)/,'');
    let fs = parseInt(this.props.routerArgs.location.search.match(/size=([^&]*)/)[1]);

    this.state = {
      swarmGateway: props.fds.swarmGateway,
      loc: loc,
      fileName: fn,
      fileSize: fs
    };

  }

  componentDidMount(){

  }

  render() {
    return (
      <div ref="download" className="download">
        <div className="download-left">
          <div className="download-file-name">{this.state.fileName}</div>
          <div className="download-file-name">{this.state.fileSize}</div>
          <div className="download-file-name">FileLInk</div>
          <div className="download-link">
            <a href={`${this.state.swarmGateway}${this.state.loc}`}>{`${this.state.swarmGateway}${this.state.loc}`}</a>
          </div>
        </div>
        <div className="download-right">
        </div>  
      </div>
    );
  }
}

export default App;