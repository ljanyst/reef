//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import {
  Button, Icon, Progress, Table, message, Popconfirm
} from 'antd';
import { connect } from 'react-redux';
import showdown from 'showdown';

import { BACKEND_OPENED } from '../actions/backend';
import TaskEditModal from './TaskEditModal';
import {
  taskNew, taskDelete, taskToggle, taskEdit
} from '../utils/backendActions';

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
  addTask = (taskId, title, description, priority) => {
    console.log(taskId, title, description, priority);
    taskNew(this.props.id, title, description, priority)
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

  editTask = (id, title, description, priority) => {
    taskEdit(id, title, description, priority)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  getTaskList = () => {
    var taskMap = {};

    if (!this.order || this.order.length !== this.props.tasks.length) {
      const comparator = (a, b) => {
        if (a.done !== b.done) {
          return (+a.done) - (+b.done);
        }
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.id - a.id;
      };
      let tasks = this.props.tasks.sort(comparator);
      this.order = tasks.map(task => task.id);
    }

    for(let i = 0; i < this.props.tasks.length; ++i){
      const task = this.props.tasks[i];
      taskMap[task.id] = task;
    }

    var tasks = [];
    for(let i = 0; i < this.order.length; ++i){
      const id = this.order[i];
      tasks.push(taskMap[id]);
    }
    return tasks;
  }

  //----------------------------------------------------------------------------
  // Constructor
  //----------------------------------------------------------------------------
  constructor(props) {
    super(props);
    this.order = null;
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
            onClick={() => this.editDialog.show(
              record.id, record.title, record.description, record.priority)
            }
          />
          {getDeleteButton(record.id)}
        </Button.Group>
      );
    };

    const getPriorityIcon = record => {
      if (record.priority === 0) {
        return (
          <div className='taskIcon'>
            <Icon
              type='meh'
              theme="twoTone"
              twoToneColor={record.done ? '#ddd' : '#3cb371'}
            />
          </div>
        );
      } else if (record.priority === 2) {
        return (
          <div className='taskIcon'>
            <Icon
              type='fire'
              theme="twoTone"
              twoToneColor={record.done ? '#ddd' : '#eb2f96'}
            />
          </div>
        );
      } else {
        return (
          <div className='taskIcon'>
            <Icon
              type='bulb'
              theme="twoTone"
              twoToneColor={record.done ? '#ddd' : '#ffa500'}
            />
          </div>
        );
      }
    };

    const getTaskDescription = record => {
      if (record.description !== "") {
        const markdown = converter.makeHtml(record.description);
        return (
          <div
            className={record.done ? 'taskMarkdownDone' : 'taskMarkdownNotDone'}
            dangerouslySetInnerHTML={{__html:markdown}} />
        );
      }
      return (<div>No description</div>);
    };

    const taskColumns = [{
      dataIndex: 'id',
      render: (_, record) => {
        const markdown = converter.makeHtml(record.title);
        return (
          <div>
            {getPriorityIcon(record)}
            <div
              className={record.done ? 'taskMarkdownDone' : 'taskMarkdownNotDone'}
              dangerouslySetInnerHTML={{__html:markdown}} />
            <div style={{float: 'right'}}>
              {taskButtons(record)}
            </div>
          </div>
        );
      }
    }];

    const tasks = this.getTaskList();

    return (
      <div>
        <TaskEditModal
          ref={(el) => { this.addDialog = el; }}
          onEdit={this.addTask}
          windowTitle='Add task'
        />
        <TaskEditModal
          ref={(el) => { this.editDialog = el; }}
          onEdit={this.editTask}
          windowTitle='Edit task'
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
          dataSource={tasks}
          size='small'
          pagination={false}
          expandedRowRender={getTaskDescription}
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
