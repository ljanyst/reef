//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 04.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React from 'react';
import { MdDirections } from 'react-icons/md';

export default function WrongRoute(props) {
  return (
    <div className='col-md-8 col-md-offset-2 app-container'>
      <div align='center'>
        <MdDirections size={300} color='DimGrey'/>
        <h3>This is not what you're looking for.</h3>
        </div>
    </div>
  );
}
