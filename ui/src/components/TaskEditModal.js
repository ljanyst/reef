//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 16.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';

import { Input, Modal, Select, Icon } from 'antd';
import PropTypes from 'prop-types';

const { TextArea } = Input;
const Option = Select.Option;

//------------------------------------------------------------------------------
// Style
//------------------------------------------------------------------------------
const styles = {
  content: {
    margin: 'auto',
    textAlign: 'center'
  }
};

//------------------------------------------------------------------------------
// Modal for editing tasks
//------------------------------------------------------------------------------
class TaskEditModal extends Component {
  //----------------------------------------------------------------------------
  // Property types
  //----------------------------------------------------------------------------
  static propTypes = {
    onEdit: PropTypes.func,
    windowTitle: PropTypes.string
  }

  state = {
    title: '',
    description: '',
    priority: 1
  }

  //----------------------------------------------------------------------------
  // Modal manipulators
  //----------------------------------------------------------------------------
  show = (id, title, description, priority) => {
    this.taskId = id;
    this.setState({
      visible: true,
      title: title ? title : '',
      description: description ? description : '',
      priority: priority ? priority : 1
    });
  }

  handleOk = (e) => {
    if (this.props.onEdit) {
      this.props.onEdit(
        this.taskId,
        this.state.title,
        this.state.description,
        this.state.priority
      );
    }
    this.setState({visible: false});
  }

  handleCancel = (e) => {
    this.setState({visible: false});
  }

  //----------------------------------------------------------------------------
  // Render the component
  //----------------------------------------------------------------------------
  render() {
    const selectPriority = (
      <Select
        value={this.state.priority}
        onChange={event => this.setState({priority: event})}
        style={{ width: 60 }}
      >
        <Option value={2}>
          <Icon type='fire' theme="twoTone" twoToneColor='#eb2f96'/>
        </Option>
        <Option value={1}>
          <Icon type='bulb' theme="twoTone" twoToneColor='#ffa500'/>
        </Option>
        <Option value={0}>
          <Icon type='meh' theme="twoTone" twoToneColor='#3cb371'/>
        </Option>
      </Select>
    );
    return (
      <Modal
        title={this.props.windowTitle}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: !this.state.title }}
        >
        <div style={styles.content}>
          <div className='dialogItem'>
            <Input
              value={this.state.title}
              style={styles.center}
              addonBefore={selectPriority}
              placeholder='Title'
              onChange={event => this.setState({title: event.target.value})}
            />
          </div>
          <div className='dialogItem'>
            <TextArea
              rows={10}
              value={this.state.description}
              onChange={(event) => this.setState({description: event.target.value})}
              placeholder='Description'
            />
          </div>
        </div>
      </Modal>
    );
  };
}

export default TaskEditModal;
