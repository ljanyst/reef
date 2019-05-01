//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 27.04.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

export const SUMMARY_LIST_SET = 'SUMMARY_LIST_SET';
export const SUMMARY_UPDATE = 'SUMMARY_UPDATE';

export function summaryListSet(summaryList) {
  return {
    type: SUMMARY_LIST_SET,
    summaries: summaryList
  };
}

export function summaryUpdate(summary) {
  return {
    type: SUMMARY_UPDATE,
    summary
  };
}
