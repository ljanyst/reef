//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Icon, Progress, Table, message, Popconfirm } from 'antd';
import { connect } from 'react-redux';

import { BACKEND_OPENED } from '../actions/backend';
import ItemAddModal from './ItemAddModal';
import { taskNew, taskDelete } from '../utils/backendActions';

//------------------------------------------------------------------------------
// Task list
//------------------------------------------------------------------------------
class TaskList extends Component {
  //----------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------
  addTask = description => {
    taskNew(this.props.id, description)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  deleteTask = id => {
    taskDelete(id)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  };

  showAddDialog = () => {
    this.addDialog.show();
  }

  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------
  render() {
    const getDeleteButton = (id) => {
      if (this.props.connected) {
        return (
          <Popconfirm
            placement="topRight"
            title={`Are you sure you want to delete this task`}
            onConfirm={() => this.deleteTask(id)}
            okText="Yes"
            cancelText="No">
            <Button icon='delete' disabled={false} />
          </Popconfirm>
        );
      }
      return (
        <Button icon='delete' disabled={true} />
      );
    };
    const taskColumns = [{
      dataIndex: 'id',
      render: (_, record) => (
        <div>
          {record.description}
          <div style={{float: 'right'}}>
            <Button.Group size="small">
              <Button icon='check-circle' disabled={!this.props.connected} />
              <Button icon='edit' disabled={!this.props.connected} />
              {getDeleteButton(record.id)}
            </Button.Group>
          </div>
        </div>)
    }];

    return (
      <div>
        <ItemAddModal
          ref={(el) => { this.addDialog = el; }}
          onAdd={this.addTask}
          title='Add task'
          label='Task title'
          />
        <div className='control-button-container'>
          <Button
            onClick={this.showAddDialog}
            disabled={!this.props.connected}
            size='small'>
            <Icon type='plus' /> Add task
          </Button>
        </div>
        <div style={{margin: '1em'}}>
          <Progress percent={Math.round(this.props.completeness * 100)} />
        </div>
        <Table
          rowKey='id'
          showHeader={false}
          columns={taskColumns}
          dataSource={this.props.tasks}
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
  return {
    id: state.project.id,
    tasks: state.project.tasks,
    completeness: state.project.completeness,
    connected: state.backend.status === BACKEND_OPENED
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);
