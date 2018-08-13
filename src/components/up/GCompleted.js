import React, { Component } from 'react';

class GCompleted extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-completed" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 6 ? "dt-fade-in" : "")}> 
          <div className="dt-completed-ui dt-page-inner-centered">
            <p>Completed</p>
          </div>
      </div>
    )
  }
}

export default GCompleted;