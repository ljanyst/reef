//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 28.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { PROJECT_SET, PROJECT_DELETE } from '../actions/project';

const projectState = {};

export function projectReducer(state = projectState, action) {
  switch(action.type) {

  case PROJECT_SET:
    return action.project;

  case PROJECT_DELETE:
    return {};

  default:
    return state;
  }
}
