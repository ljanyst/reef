//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import {
  Panel, ListGroup, ListGroupItem, ButtonGroup, Button, Glyphicon, Table, Badge,
  ProgressBar
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import BadgeStyle from './BadgeStyle';

class ProjectView extends Component {
  render() {

    return (
      <div className='col-md-6 col-md-offset-3'>
        <BadgeStyle name='purple' color='#5243AA' />
        <BadgeStyle name='orange' color='#FF8B00' />
        <BadgeStyle name='blue' color='#0052CC' />

        <Panel>
          <Panel.Heading>
            Advanced Math #1
            <div className="project-panel-menu">
              <ButtonGroup bsSize="xsmall">
                <Button>
                  <Glyphicon glyph='pencil'/>
                </Button>
                <Button>
                  <Glyphicon glyph='remove'/>
                </Button>
              </ButtonGroup>
            </div>
          </Panel.Heading>
          <Panel.Body>
            <div className="project-badge-belt">
              <Badge bsClass='badge badge-purple'>Purple</Badge>
              <Badge bsClass='badge badge-orange'>Orange</Badge>
              <Badge bsClass='badge badge-blue'>Blue</Badge>
            </div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            ac metus condimentum, venenatis lorem vel, blandit erat. Maecenas
            turpis justo, pulvinar at ipsum ut, aliquam finibus libero.
            Vestibulum viverra neque non egestas varius. Maecenas eget tellus
            quis ante interdum vulputate non eu lectus. Ut venenatis vulputate
            pulvinar. Pellentesque gravida dui risus, vitae bibendum sem
            fringilla a. Vivamus elementum massa non volutpat condimentum.
            Vivamus elementum, ex eu eleifend finibus, ex turpis ultricies nibh,
            sit amet fermentum odio lacus id ligula. Curabitur eget nisi massa.
            Morbi porttitor venenatis dui, sed consequat nulla mattis eget.
            Donec auctor massa enim. Sed aliquam molestie sem, non volutpat
            justo sodales sed. Nunc tincidunt, massa sit amet ornare commodo,
            arcu magna dictum augue, in dictum libero dui sed nisl. 
          </Panel.Body>
          <div className='project-section-separator'>Tasks</div>
            <div className='control-button-container'>
              <LinkContainer to="/add-project">
                <Button bsSize='xsmall'>
                  <Glyphicon glyph='plus' /> Add task
                </Button>
              </LinkContainer>
            </div>
            <div className='project-progress-container'>
              <ProgressBar striped bsStyle='info' now={5} />
            </div>
          <ListGroup>
            <ListGroupItem href='#'>
              Item 1
              <div className="project-panel-menu">
                <ButtonGroup bsSize="xsmall">
                  <Button>
                    <Glyphicon glyph='unchecked'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='pencil'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='remove'/>
                  </Button>
                </ButtonGroup>
              </div>
            </ListGroupItem>
            <ListGroupItem href='#'>
              Item 2
              <div className="project-panel-menu">
                <ButtonGroup bsSize="xsmall">
                  <Button>
                    <Glyphicon glyph='unchecked'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='pencil'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='remove'/>
                  </Button>
                </ButtonGroup>
              </div>
            </ListGroupItem>
            <ListGroupItem href='#'>
              Item 3
              <div className="project-panel-menu">
                <ButtonGroup bsSize="xsmall">
                  <Button>
                    <Glyphicon glyph='unchecked'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='pencil'/>
                  </Button>
                  <Button>
                    <Glyphicon glyph='remove'/>
                  </Button>
                </ButtonGroup>
              </div>
            </ListGroupItem>
          </ListGroup>

          <div className='project-section-separator'>Work sessions</div>
          <div className='control-button-container'>
              <LinkContainer to="/add-project">
                <Button bsSize='xsmall'>
                  <Glyphicon glyph='plus' /> Add session
                </Button>
              </LinkContainer>
            </div>

          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th className='table-center'>#</th>
                <th className='table-center'>Date</th>
                <th className='table-center'>Time spent</th>
                <th className='table-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='table-right'>1</td>
                <td className='table-center'>2018-11-10</td>
                <td className='table-right'>12:23</td>
                <td className='table-center'>
                  <ButtonGroup bsSize="xsmall">
                    <Button>
                      <Glyphicon glyph='pencil'/>
                    </Button>
                    <Button>
                      <Glyphicon glyph='remove'/>
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td className='table-right'>2</td>
                <td className='table-center'>2018-12-11</td>
                <td className='table-right'>32:32</td>
                <td className='table-center'>
                  <ButtonGroup bsSize="xsmall">
                    <Button>
                      <Glyphicon glyph='pencil'/>
                    </Button>
                    <Button>
                      <Glyphicon glyph='remove'/>
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            </tbody>
          </Table>
        </Panel>
      </div>
    );
  }
}

export default ProjectView;
