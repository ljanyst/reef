//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const BACKEND_STATUS_SET = 'BACKEND_STATUS_SET';
export const BACKEND_COUNTDOWN_SET = 'BACKEND_COUNTDOWN_SET';

export const BACKEND_CONNECTING = 'BACKEND_CONNECTING';
export const BACKEND_OPENED = 'BACKEND_OPENED';
export const BACKEND_CLOSED = 'BACKEND_CLOSED';

export function backendStatusSet(status) {
  return {
    type: BACKEND_STATUS_SET,
    status
  };
}
export function backendCountdownSet(countdown) {
  return {
    type: BACKEND_COUNTDOWN_SET,
    countdown
  };
}
