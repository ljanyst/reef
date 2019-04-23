//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { store } from '../';
import { Backend } from './Backend';
import { tagListSet, tagNew, tagDelete } from '../actions/tags';

//------------------------------------------------------------------------------
// Make backend events change the state of the stare
//------------------------------------------------------------------------------
export const messageStoreEvent = (event, data) => {
  if(event !== Backend.MSG_RECEIVED)
    return;
  switch(data.type) {
  case 'TAG_LIST':
    store.dispatch(tagListSet(data.payload));
    break;

  case 'TAG_NEW':
    store.dispatch(tagNew(data.payload));
    break;

  case 'TAG_DELETE':
    store.dispatch(tagDelete(data.payload));
    break;

  default:
    break;
  }
};
