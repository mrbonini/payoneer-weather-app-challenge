import React from 'react';
import { Provider } from 'react-redux';

import Weather from './pages/weather/Weather';
import { store } from './store/index';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Weather />
    </Provider>
  );
}

export default (App);
