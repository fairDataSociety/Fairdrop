import React from 'react';
import ReactDOM from 'react-dom';
import DWallet from "./DWallet";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DWallet />, div);
  ReactDOM.unmountComponentAtNode(div);
});