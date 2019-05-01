//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 23.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import {
  TAG_UPDATE, TAG_LIST_SET, TAG_DELETE, TAG_EDIT
} from '../actions/tags';

const tagsState = {};

export function tagsReducer(state = tagsState, action) {
  var newState = {
    ...state
  };

  switch(action.type) {

  case TAG_LIST_SET:
    let tags =  action.tags.reduce((acc, current) => {
      acc[current.id] = current;
      return acc;
    }, {});
    return tags;

  case TAG_UPDATE:
    newState[action.tag.id] = action.tag;
    return newState;

  case TAG_DELETE:
    delete newState[action.id];
    return newState;

  case TAG_EDIT:
    newState[action.id].name = action.newName;
    newState[action.id].color = action.newColor;
    return newState;

  default:
    return state;
  }
}
