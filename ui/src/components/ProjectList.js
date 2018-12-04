//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Panel, Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import TagPicker from './TagPicker';

class ProjectList extends Component {
  render() {
    var list = (
      <Panel>
        <div className='list-empty'>No projects.</div>
      </Panel>
    );
    return (
      <div className='col-md-8 col-md-offset-2'>
        <h2>Projects</h2>
        <div className='control-button-container'>
          <LinkContainer to="/add-project">
            <Button bsSize='xsmall'>
              <Glyphicon glyph='plus' /> Add project
            </Button>
          </LinkContainer>
        </div>
        <TagPicker/>
        <div className='list'>
          {list}
        </div>
      </div>
    );
  }
}

export default ProjectList;
