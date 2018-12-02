import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import ReefApp from './components/ReefApp';

ReactDOM.render(
  <ReefApp />,
  document.getElementById('root'));

serviceWorker.register();
