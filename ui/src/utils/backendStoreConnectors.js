//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { store } from '../';
import { Backend } from './Backend';
import { tagListSet, tagUpdate, tagDelete, tagEdit } from '../actions/tags';
import { summaryListSet, summaryUpdate } from '../actions/summaries';
import { projectDelete, projectUpdate } from '../actions/project';

const actionMap = {
  TAG_LIST: tagListSet,
  TAG_UPDATE: tagUpdate,
  TAG_DELETE: tagDelete,
  TAG_EDIT: tagEdit,
  SUMMARY_LIST: summaryListSet,
  SUMMARY_UPDATE: summaryUpdate,
  PROJECT_DELETE: projectDelete,
  PROJECT_UPDATE: projectUpdate
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
