//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Make id
//------------------------------------------------------------------------------
export function makeId(length) {
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for(var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

//------------------------------------------------------------------------------
// Capitalize first letter
//------------------------------------------------------------------------------
export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

//------------------------------------------------------------------------------
// Convert minutes to hours
//------------------------------------------------------------------------------
export function minutesToHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  var str = hours.toString() + ':';
  if(mins < 10) {
    str += '0';
  }
  return str + mins.toString();
}

//------------------------------------------------------------------------------
// Convert minutes to a string
//------------------------------------------------------------------------------
export function minutesToString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  var str = '';
  if (hours === 1) {
    str += '1 hour, ';
  } else if (hours !== 0) {
    str += hours.toString() + ' hours, ';
  }

  if (hours === 0 || mins !== 0) {
    if (minutes === 1) {
      str += '1 minute';
    } else {
      str += mins.toString() + ' minutes';
    }
  }
  return str;
}

//------------------------------------------------------------------------------
// Check if list contains element
//------------------------------------------------------------------------------
export function contains(elem, list) {
  return list.indexOf(elem) > -1;
}
