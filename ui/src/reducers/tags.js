//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 23.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { TAG_NEW, TAG_LIST_SET, TAG_DELETE } from '../actions/tags';

const tagsState = {};

export function tagsReducer(state = tagsState, action) {
  var newState = {
    ...state
  };

  switch(action.type) {

  case TAG_LIST_SET:
    let tags =  action.tags.reduce((acc, current) => {
      acc[current.name] = current;
      return acc;
    }, {});
    return tags;

  case TAG_NEW:
    newState[action.tag.name] = action.tag;
    return newState;

  case TAG_DELETE:
    delete newState[action.name];
    return newState;

  default:
    return state;
  }
}
