import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {shallow, mount} from 'enzyme';

jest.mock('react-dom');
ReactDOM.URLSearchParams = jest.fn();

it('renders without crashing', () => {
  let div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});