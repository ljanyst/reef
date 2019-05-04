//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import {
  Button, Icon, Progress, Table, message, Popconfirm, Input
} from 'antd';
import { connect } from 'react-redux';
import showdown from 'showdown';

import { BACKEND_OPENED } from '../actions/backend';
import ItemAddModal from './ItemAddModal';
import {
  taskNew, taskDelete, taskToggle, taskEdit
} from '../utils/backendActions';

//------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------
const styles = {
  taskEdit: {
    width: '80%',
    display: 'inline-block'
  }
};

//------------------------------------------------------------------------------
// Task list
//------------------------------------------------------------------------------
class TaskList extends Component {
  //----------------------------------------------------------------------------
  // State
  //----------------------------------------------------------------------------
  state = {
    edit: null
  };

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

  toggleTask = id => {
    taskToggle(id)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  editTask = (id, description) => {
    taskEdit(id, description)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------
  render() {
    var converter = new showdown.Converter();

    const getDeleteButton = id => {
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

    const taskButtons = record => {
      if (this.state.edit === record.id) {
        return (
          <Button.Group size="small">
            <Button
              icon='save'
              disabled={!this.props.connected}
              onClick={() => {
                this.editTask(record.id, this.state.description);
                this.setState({edit: null});
              }}>
              Save
            </Button>
          </Button.Group>
        );
      }
      return (
        <Button.Group size="small">
          <Button
            icon={record.done ? 'minus-circle' : 'check-circle'}
            disabled={!this.props.connected}
            onClick={() => this.toggleTask(record.id)}
          />
          <Button
            icon='edit'
            disabled={!this.props.connected}
            onClick={() => this.setState({
              edit: record.id,
              description: record.description
            })}
          />
          {getDeleteButton(record.id)}
        </Button.Group>
      );
    };

    const getDescription = record => {
      if (this.state.edit === record.id) {
        return (
          <div style={styles.taskEdit} >
            <Input
              size="small"
              value={this.state.description}
              onChange={(event) => this.setState({description: event.target.value})}
            />
          </div>
        );
      }
      const markdown = converter.makeHtml(record.description);
      return (
        <div
          className={record.done ? 'taskMarkdownDone' : 'taskMarkdownNotDone'}
          dangerouslySetInnerHTML={{__html:markdown}} />
      );
    };

    const taskColumns = [{
      dataIndex: 'id',
      render: (_, record) => (
        <div>
          {getDescription(record)}
          <div style={{float: 'right'}}>
              {taskButtons(record)}
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
