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
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import './index.css';
import './bootstrap-layout.css';
import 'antd/dist/antd.css';

import { backendReducer } from './reducers/backend';
import { tagsReducer } from './reducers/tags';
import { summariesReducer } from './reducers/summaries';
import { projectReducer } from './reducers/project';
import {
  backendStatusSet, backendCountdownSet,
  BACKEND_CONNECTING, BACKEND_OPENED, BACKEND_CLOSED
} from './actions/backend';
import { backend, Backend } from './utils/Backend';
import { messageStoreEvent } from './utils/backendStoreConnectors';

import ReefApp from './components/ReefApp';

//------------------------------------------------------------------------------
// Redux store
//------------------------------------------------------------------------------
export const store = createStore(
  combineReducers({
    backend: backendReducer,
    tags: tagsReducer,
    summaries: summariesReducer,
    project: projectReducer
  }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

//------------------------------------------------------------------------------
// Make backend events change the state of the stare
//------------------------------------------------------------------------------
const backendStoreEvent = (event, data) => {
  if(event === Backend.CONNECTING)
    store.dispatch(backendStatusSet(BACKEND_CONNECTING));
  else if(event === Backend.OPENED)
    store.dispatch(backendStatusSet(BACKEND_OPENED));
  else if(event === Backend.CLOSED)
    store.dispatch(backendStatusSet(BACKEND_CLOSED));
  else if(event === Backend.COUNTDOWN)
    store.dispatch(backendCountdownSet(data));
};

backend.addEventListener(backendStoreEvent);
backend.addEventListener(messageStoreEvent);

//------------------------------------------------------------------------------
// The App component
//------------------------------------------------------------------------------
ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <ReefApp />
      </BrowserRouter>
    </Provider>,
  document.getElementById('root'));

serviceWorker.register();
