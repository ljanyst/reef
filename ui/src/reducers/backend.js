//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import {
  BACKEND_STATUS_SET, BACKEND_COUNTDOWN_SET, BACKEND_CONNECTING
} from '../actions/backend';

const backendState = {
  status: BACKEND_CONNECTING,
  countdown: 0
};

export function backendReducer(state = backendState, action) {
  switch(action.type) {

  case BACKEND_STATUS_SET:
    return {
      ...state,
      status: action.status
    };

  case BACKEND_COUNTDOWN_SET:
    return {
      ...state,
      countdown: action.countdown
    };

  default:
    return state;
  }
}
