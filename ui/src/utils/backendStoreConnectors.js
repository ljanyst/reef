//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { store } from '../';
import { Backend } from './Backend';
import { tagListSet, tagNew, tagDelete, tagEdit } from '../actions/tags';

const actionMap = {
  TAG_LIST: tagListSet,
  TAG_NEW: tagNew,
  TAG_DELETE: tagDelete,
  TAG_EDIT: tagEdit
};

//------------------------------------------------------------------------------
// Make backend events change the state
//------------------------------------------------------------------------------
export const messageStoreEvent = (event, data) => {
  if(event !== Backend.MSG_RECEIVED) {
    return;
  }

  if (data.type === 'ACTION_EXECUTED') {
    return;
  }

  if (data.type in actionMap) {
    store.dispatch(actionMap[data.type](data.payload));
  } else {
    console.log('Unknown message type:', data.type);
  }
};
