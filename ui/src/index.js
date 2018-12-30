//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

import './index.css';
import './bootstrap-layout.css';
import 'antd/dist/antd.css';

import ReefApp from './components/ReefApp';

ReactDOM.render(
  <BrowserRouter>
     <ReefApp />
  </BrowserRouter>,
  document.getElementById('root'));

serviceWorker.register();
