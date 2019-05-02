//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Table, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import sortBy from 'sort-by';

import SessionAddModal from './SessionAddModal';
import { sessionNew } from '../utils/backendActions';
import { BACKEND_OPENED } from '../actions/backend';
import { minutesToString } from '../utils/helpers';

//------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------
const styles = {
    workSessionNumber: {
    borderRight: '1px solid LightGray',
    color: 'Gray',
    textAlign: 'right',
    width: '4em',
    maxWidth: '4em',
    marginRight: '1em',
    paddingRight: '0.5em',
    float: 'left'
  }
};

//------------------------------------------------------------------------------
// Work session list
//------------------------------------------------------------------------------
class WorkSessionList extends Component {
  //----------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------
  addSession = (duration, date) => {
    sessionNew(this.props.projectId, duration, date)
      .catch(error => message.error(error.message));
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------
  render() {
    const sessionColumns = [{
      dataIndex: 'id',
      render: (_, record) => (
        <div>
          <div style={styles.workSessionNumber}>
            {record.num}.
          </div>
          <div>
            Worked for <b>{minutesToString(record.duration)} </b>
            on {moment(record.date*1000).format('dddd, MMMM Do, YYYY')}.
            <div style={{float: 'right'}}>
              <Button.Group size="small">
                <Button icon='delete' disabled={!this.props.connected} />
              </Button.Group>
            </div>
          </div>
        </div>
      )}];

    return (
      <div>
        <SessionAddModal
          ref={(el) => { this.addDialog = el; }}
          onAdd={this.addSession}
        />
        <div className='control-button-container'>
          <Button
            disabled={!this.props.connected}
            onClick={this.showAddDialog}
            icon='plus'
            size='small'
          >
            Add session
          </Button>
        </div>
        <Table
          rowKey='id'
          showHeader={false}
          columns={sessionColumns}
          dataSource={this.props.sessions}
          size='small'
          pagination={false}
         />
      </div>
    );
  }
}

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  var i = state.project.sessions.length;
  var sessions = state.project.sessions
      .sort(sortBy('-date'))
      .map(obj => {
        i--;
        return {num: i+1, ...obj};
        });

  return {
    connected: state.backend.status === BACKEND_OPENED,
    projectId: state.project.id,
    sessions: sessions
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkSessionList);
