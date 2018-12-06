//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { SliderPicker } from 'react-color';

class TagView extends Component {
  render() {
    return (
      <div className='tag'>
        <Panel>
          <div className='tag-container'>
            <div className="tag-name">Math</div>
            <div><SliderPicker /></div>
          </div>
        </Panel>
      </div>
    );
  }
}

export default TagView;

