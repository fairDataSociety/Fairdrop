import React, { Component } from 'react';

class AboutFairdrop extends Component{
  
  constructor(props) {
    super(props);
  } 

  render(){
    return (
      <div className="content-outer">
        <div className="content-inner">
          <div className="content-header">
            <img src={this.props.appRoot+"/assets/images/fairdrop-logo.svg"}/>
          </div>
          <div className="content-text">
            <p>
              Lorem ipsum dolor sit amet, justo aeque definitiones nam an, eros nostrum nec at, 
              has urbanitas interpretaris ne. In sed invenire delicatissimi. 
              Id affert tation probatus qui, per ea salutatus pertinacia, essent vivendum mnesarchum est ad. 
            </p>

            <p>
              Lorem ipsum dolor sit amet, justo aeque definitiones nam an, eros nostrum nec at, has urbanitas interpretaris ne. In sed invenire delicatissimi. 
              Id affert tation probatus qui, per ea salutatus pertinacia, essent vivendum mnesarchum est ad. Congue meliore philosophia mei no, ne mei quidam epicurei. 
            </p>

            <p>
              Lorem ipsum dolor sit amet, justo aeque definitiones nam an, eros nostrum nec at, has urbanitas interpretaris ne. In sed invenire delicatissimi. 
              Id affert tation probatus qui, per ea salutatus pertinacia, essent vivendum mnesarchum est ad. Congue meliore philosophia mei no, ne mei quidam epicurei. 
            </p>

            <p>
              Ad sit ullamcorper complectitur, iudico insolens ne mel. Per idque recteque ad, has ne omnes primis singulis, vim saepe noluisse an.
            </p>

          </div>
        </div>
      </div>
    )
  }
}

export default AboutFairdrop;