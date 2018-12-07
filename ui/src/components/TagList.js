//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import {
  Button, ButtonGroup, Glyphicon, Table, Panel, Badge
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import BadgeStyle from './BadgeStyle';

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
        <BadgeStyle name='purple' color='#5243AA' />
        <BadgeStyle name='orange' color='#FF8B00' />
        <BadgeStyle name='blue' color='#0052CC' />
        <BadgeStyle name='green' color='#36B37E' />
        <BadgeStyle name='ocean' color='#00B8D9' />
        <BadgeStyle name='yellow' color='#FFC400' />
        <BadgeStyle name='forest' color='#00875A'/>

        <Panel>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th className='table-center'>#</th>
                <th className='table-center'>Tag</th>
                <th className='table-center'># projects</th>
                <th className='table-center'>Hours (total)</th>
                <th className='table-center'>Hours (this year)</th>
                <th className='table-center'>Hours (this month)</th>
                <th className='table-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='table-right'>1</td>
                <td><Badge bsClass='badge badge-purple'>Purple</Badge></td>
                <td className='table-right'>12</td>
                <td className='table-right'>3423:44</td>
                <td className='table-right'>423:44</td>
                <td className='table-right'>23:44</td>
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
                <td><Badge bsClass='badge badge-orange'>Orange</Badge></td>
                <td className='table-right'>32</td>
                <td className='table-right'>3423:34</td>
                <td className='table-right'>323:44</td>
                <td className='table-right'>13:44</td>
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
                <td className='table-right'>3</td>
                <td><Badge bsClass='badge badge-blue'>Blue</Badge></td>
                <td className='table-right'>4</td>
                <td className='table-right'>2423:34</td>
                <td className='table-right'>223:44</td>
                <td className='table-right'>3:44</td>
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
                <td className='table-right'>4</td>
                <td><Badge bsClass='badge badge-green'>Green</Badge></td>
                <td className='table-right'>5</td>
                <td className='table-right'>1423:34</td>
                <td className='table-right'>123:44</td>
                <td className='table-right'>2:44</td>
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
                <td className='table-right'>5</td>
                <td><Badge bsClass='badge badge-ocean'>Ocean</Badge></td>
                <td className='table-right'>2</td>
                <td className='table-right'>423:34</td>
                <td className='table-right'>23:44</td>
                <td className='table-right'>1:44</td>
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
                <td className='table-right'>6</td>
                <td><Badge bsClass='badge badge-yellow'>Yellow</Badge></td>
                <td className='table-right'>1</td>
                <td className='table-right'>323:34</td>
                <td className='table-right'>13:44</td>
                <td className='table-right'>0:44</td>
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
                <td className='table-right'>7</td>
                <td><Badge bsClass='badge badge-forest'>Forest</Badge></td>
                <td className='table-right'>1</td>
                <td className='table-right'>223:34</td>
                <td className='table-right'>3:44</td>
                <td className='table-right'>0:34</td>
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

export default TagList;
