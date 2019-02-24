//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { Backend } from './Backend';

//------------------------------------------------------------------------------
// Make backend events change the state of the stare
//------------------------------------------------------------------------------
export const messageStoreEvent = (event, data) => {
  if(event !== Backend.MSG_RECEIVED)
    return;
};
