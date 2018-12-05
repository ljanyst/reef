//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Panel, Button, Glyphicon, ListGroup, ListGroupItem, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import TagPicker from './TagPicker';
import BadgeStyle from './BadgeStyle';

class ProjectList extends Component {
  render() {
    var list = (
      <Panel>
        <div className='list-empty'>No projects.</div>
      </Panel>
    );

    if(true) {
      list = (
        <ListGroup>
          <BadgeStyle name='purple' color='#5243AA' />
          <BadgeStyle name='orange' color='#FF8B00' />
          <BadgeStyle name='blue' color='#0052CC' />
          <BadgeStyle name='green' color='#36B37E' />
          <BadgeStyle name='ocean' color='#00B8D9' />
          <BadgeStyle name='yellow' color='#FFC400' />
          <BadgeStyle name='forest' color='#00875A'/>
          <ListGroupItem>
            <div className='list-item'>
              <strong>
                <Link to={`project/asdf`}>
                  Advanced Math - semester #1
                </Link>
              </strong>
              <div className='list-metadata'>
                <Badge bsClass='badge badge-purple'>Purple</Badge>
                <Badge bsClass='badge badge-orange'>Orange</Badge>
                <Badge bsClass='badge badge-blue'>Blue</Badge>
                <div className='list-progress'>34%</div>
              </div>
            </div>
          </ListGroupItem>

          <ListGroupItem>
            <div className='list-item'>
              <strong>
                <Link to={`project/asdf`}>
                  Multiple view geometry
                </Link>
              </strong>
              <div className='list-metadata'>
                <Badge bsClass='badge badge-blue'>Blue</Badge>
                <Badge bsClass='badge badge-orange'>Orange</Badge>
                <Badge bsClass='badge badge-green'>Green</Badge>
                <Badge bsClass='badge badge-ocean'>Ocean</Badge>
                <div className='list-progress'>10%</div>
              </div>
            </div>
          </ListGroupItem>

          <ListGroupItem>
            <div className='list-item'>
              <strong>
                <Link to={`project/asdf`}>
                  Structure and Interpretation of Computer programs
                </Link>
              </strong>
              <div className='list-metadata'>
                <Badge bsClass="badge badge-yellow">Yellow</Badge>
                <Badge bsClass="badge badge-forest">Forest</Badge>
                <div className='list-progress'>100%</div>
              </div>
              </div>
          </ListGroupItem>
        </ListGroup>
      );
    }

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
