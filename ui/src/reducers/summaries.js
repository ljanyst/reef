//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { SUMMARY_LIST_SET, SUMMARY_NEW } from '../actions/summaries';

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

  case SUMMARY_NEW:
    newState[action.summary.id] = action.summary;
    return newState;

  default:
    return state;
  }
}
