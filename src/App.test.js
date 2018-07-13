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

describe('#dt-toggle-is-encrypted-button', ()=>{
    it('should fire toggleFileShouldEncrypt event',()=>{

      const spy = jest.spyOn(App.prototype, 'toggleFileShouldEncrypt');

      const component = mount(
        <App />,
      );

      component.update();

      component.find('#dt-toggle-is-encrypted-button').simulate('click');

      expect(spy).toHaveBeenCalled();
      expect(component.state().fileShouldEncrypt).toEqual(true);

      component.find('#dt-toggle-is-encrypted-button').simulate('click');

      expect(spy).toHaveBeenCalled();
      expect(component.state().fileShouldEncrypt).toEqual(false);
    });
})