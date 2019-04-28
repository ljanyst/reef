//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 28.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const PROJECT_SET = 'PROJECT_SET';

export function projectSet(project) {
  return {
    type: PROJECT_SET,
    project
  };
}
