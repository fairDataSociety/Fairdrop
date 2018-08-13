import React, { Component } from 'react';

class GCompleted extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-progress" className={'ui-state-'+this.props.parentState.uiState}> 
        progress
      </div>
    )
  }
}

export default GCompleted;