//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 05.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React from 'react';
import chroma from 'chroma-js';

export default function BadgeStyle(props) {
  const bgColor = chroma(props.color).alpha(0.2).css();
  return (
    <style type="text/css">
      {`
         .badge-${props.name} {
           background-color: ${bgColor};
           color: ${props.color};
           font-weight: normal;
           border-radius: 10%;
           margin: 0.2em;
         }
      `}
    </style>
  );
}
