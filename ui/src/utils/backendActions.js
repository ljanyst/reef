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
    tagNewParams: {name,  color}
  });
}

export function tagDelete(id) {
  return backend.sendMessage({
    action: 'TAG_DELETE',
    tagDeleteParams: id
  });
}

export function tagEdit(id, newName, newColor) {
  return backend.sendMessage({
    action: 'TAG_EDIT',
    tagEditParams: {id, newName, newColor}
  });
}
