//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import TagView from './TagView';

class TagList extends Component {
  render() {

    return (
      <div className='col-md-8 col-md-offset-2'>
        <h2>Tags</h2>
        <div className='control-button-container'>
          <LinkContainer to="/add-tag">
            <Button bsSize='xsmall'>
              <Glyphicon glyph='plus' /> Add tag
            </Button>
          </LinkContainer>
        </div>
        <div className='tag-list'>
          <TagView />
          <TagView />
          <TagView />
          <TagView />
          <TagView />
          <TagView />
          <TagView />
          <TagView />
        </div>
      </div>
    );
  }
}

export default TagList;
