//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.03.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const TAG_NEW = 'TAG_NEW';
export const TAG_LIST_SET = 'TAG_LIST_SET';
export const TAG_DELETE = 'TAG_DELETE';
export const TAG_EDIT = 'TAG_EDIT';

export function tagNew(tag) {
  return {
    type: TAG_NEW,
    tag
  };
}

export function tagListSet(tagList) {
  return {
    type: TAG_LIST_SET,
    tags: tagList
  };
}

export function tagDelete(id) {
  return {
    type: TAG_DELETE,
    id
  };
}

export function tagEdit(payload) {
  return {
    type: TAG_EDIT,
    id: payload.id,
    newName: payload.newName,
    newColor: payload.newColor
  };
}
