//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { SUMMARY_LIST_SET, SUMMARY_UPDATE } from '../actions/summaries';
import { PROJECT_DELETE } from '../actions/project';

const summariesState = {};

export function summariesReducer(state = summariesState, action) {
  var newState = {
    ...state
  };

  switch(action.type) {

  case SUMMARY_LIST_SET:
    let summaries =  action.summaries.reduce((acc, current) => {
      acc[current.id] = current;
      return acc;
    }, {});
    return summaries;

  case SUMMARY_UPDATE:
    newState[action.summary.id] = action.summary;
    return newState;

  case PROJECT_DELETE:
    delete newState[action.id];
    return newState;

  default:
    return state;
  }
}
