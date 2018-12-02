//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';

import TagPicker from './TagPicker';

class ProjectList extends Component {
  render() {
    return (
      <div className='col-md-8 col-md-offset-2'>
        <TagPicker/>
      </div>
    );
  }
}

export default ProjectList;
