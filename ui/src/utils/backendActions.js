//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.03.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { backend } from './Backend';

export function tagNew(name, color) {
  return backend.sendMessage({
    action: 'TAG_NEW',
    name,
    color
  });
}
