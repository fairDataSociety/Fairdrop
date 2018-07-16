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

it('should call handleFileChange on change event for #file-input', () => {

  const spy = jest.spyOn(DWallet.prototype, 'handleFileChange');

  const component = mount(
    <DWallet />,
  );

  component.update();

  const input = component.find('#dt-hidden-file-input');

  var blob = new Blob(['{"version":3,"id":"df476fec-eb59-4e79-8ef9-6be04cacd559","address":"bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32","Crypto":{"ciphertext":"2c9dd629ac4c74f3a553c562ecdbd3f8cc6c610a7cbe796147bd7f1ece531c3e","cipherparams":{"iv":"a12b4877811ce8e1a279ce91c444d5d6"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"8cb4d854455c69002c313540a93cbcfa2ef6d168b70e539f260c488a48b340a4","n":8192,"r":8,"p":1},"mac":"8040122aa0b28630e7e911439d2e7590817de5e020b16e7bb2f39f21301bf9fb"}}'], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = "UTC--2018-07-12T19-29-19.225Z--bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32";

  input.simulate('change', {
    target: {
       files: [
          blob
       ]
    }
  });

  expect(spy).toHaveBeenCalled();

});

it('should call handleFileChange on change event for #file-input', () => {

  const spy = jest.spyOn(DWallet.prototype, 'handleFileChange');

  const component = mount(
    <DWallet />,
  );

  component.update();

  const input = component.find('#dt-hidden-file-input');

  let fileName = "UTC--2018-07-12T19-29-19.225Z--bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32";
  var blob = new Blob(['{"version":3,"id":"df476fec-eb59-4e79-8ef9-6be04cacd559","address":"bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32","Crypto":{"ciphertext":"2c9dd629ac4c74f3a553c562ecdbd3f8cc6c610a7cbe796147bd7f1ece531c3e","cipherparams":{"iv":"a12b4877811ce8e1a279ce91c444d5d6"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"8cb4d854455c69002c313540a93cbcfa2ef6d168b70e539f260c488a48b340a4","n":8192,"r":8,"p":1},"mac":"8040122aa0b28630e7e911439d2e7590817de5e020b16e7bb2f39f21301bf9fb"}}'], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = fileName;

  input.simulate('change', {
    target: {
       files: [
          blob
       ]
    }
  });

  expect(spy).toHaveBeenCalled();

  // expect(component.state().selectedWalletFileName).toEqual(fileName);
});