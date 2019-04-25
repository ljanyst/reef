//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 23.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { TAG_NEW, TAG_LIST_SET, TAG_DELETE, TAG_EDIT } from '../actions/tags';

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

  case TAG_EDIT:
    if (action.newName !== action.oldName) {
      newState[action.newName] = newState[action.oldName];
      delete newState[action.oldName];
    }
    newState[action.newName].name = action.newName;
    newState[action.newName].color = action.newColor;
    return newState;

  default:
    return state;
  }
}
