import * as React from 'react';
import { render } from '@testing-library/react';

import 'jest-canvas-mock';

import { App } from '../src/example/App';

jest.mock('../src/example/App.css', () => {
  return {};
});

describe('Common render', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
