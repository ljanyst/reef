//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import ReefApp from './components/ReefApp';

ReactDOM.render(
  <ReefApp />,
  document.getElementById('root'));

serviceWorker.register();
