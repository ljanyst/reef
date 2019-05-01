//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 28.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const PROJECT_SET = 'PROJECT_SET';
export const PROJECT_DELETE = 'PROJECT_DELETE';
export const PROJECT_UPDATE = 'PROJECT_UPDATE';

export function projectSet(project) {
  return {
    type: PROJECT_SET,
    project
  };
}

export function projectDelete(id) {
  return {
    type: PROJECT_DELETE,
    id
  };
}

export function projectUpdate(project) {
  return {
    type: PROJECT_UPDATE,
    project
  };
}
