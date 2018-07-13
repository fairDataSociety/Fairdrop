import React from 'react';
import ReactDOM from 'react-dom';
import DWallet from "./DWallet";
import {shallow, mount} from 'enzyme';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DWallet />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('#dt-toggle-button', ()=>{
    it('should fire toggleFileShouldEncrypt event',()=>{

      const spy = jest.spyOn(DWallet.prototype, 'handleSelectWallet');

      const component = mount(
        <DWallet />,
      );

      component.update();

      component.find('#dt-select-wallet-button').simulate('click');

      expect(spy).toHaveBeenCalled();

    });
});

describe('#dt-select-wallet-button', ()=>{
    it('should fire toggleFileShouldEncrypt event',()=>{

      const spy = jest.spyOn(DWallet.prototype, 'handleSelectWallet');

      const component = mount(
        <DWallet />,
      );

      component.update();

      component.find('#dt-select-wallet-button').simulate('click');

      expect(spy).toHaveBeenCalled();

    });
});