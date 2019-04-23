//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.03.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const TAG_NEW = 'TAG_NEW';
export const TAG_LIST_SET = 'TAG_LIST_SET';
export const TAG_DELETE = 'TAG_DELETE';

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

export function tagDelete(name) {
  return {
    type: TAG_DELETE,
    name
  };
}
