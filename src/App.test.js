import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {shallow, mount} from 'enzyme';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('should have initial states', ()=>{
  const component = shallow(
    <App />,
  );

  expect(component.state().fileShouldEncrypt).toEqual(false);
})

describe('#toggleFileShouldEncrypt', ()=>{
    it('should toggle state',()=>{
      const component = shallow(
        <App />,
      );

      let app = component.instance();

      expect(app.state.fileShouldEncrypt).toEqual(false);

      app.toggleFileShouldEncrypt();

      expect(app.state.fileShouldEncrypt).toEqual(true);
    });
})