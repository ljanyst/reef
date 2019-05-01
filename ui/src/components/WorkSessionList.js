//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Table } from 'antd';

import SessionAddModal from './SessionAddModal';

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
    console.log("Add session:", date, duration);
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------
  render() {
    const sessionColumns = [{
      dataIndex: 'key',
      render: (_, record) => (
        <div>
          <div style={styles.workSessionNumber}>
            {record.key}.
          </div>
          <div>
            {record.data}.
            <div style={{float: 'right'}}>
              <Button.Group size="small">
                <Button icon='delete' disabled={!this.props.connected} />
              </Button.Group>
            </div>
          </div>
        </div>
      )}];

    const sessionData = [{
      key: '1',
      data: 'Worked for <b>2 hour and 2 minutes</b> on Wednesday, December 14, 2018.'
    }, {
      key: '2',
      data: 'Worked for <b>3 hours and 25 minutes</b> on Thursday, December 14, 2018.'
    },  {
      key: '12343',
      data: 'Worked for <b>4 hours and 45 minutes</b> on Friday, December 17, 2018.'
    }];

    return (
      <div>
        <SessionAddModal
          ref={(el) => { this.addDialog = el; }}
          onAdd={this.addSession}
        />
        <div className='control-button-container'>
          <Button
            onClick={this.showAddDialog}
            icon='plus'
            size='small'
          >
            Add session
          </Button>
        </div>
        <Table
          showHeader={false}
          columns={sessionColumns}
          dataSource={sessionData}
          size='small'
          pagination={false}
         />
      </div>
    );
  }
}

export default WorkSessionList;
