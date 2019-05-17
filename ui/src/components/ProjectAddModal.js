//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Input, Modal } from 'antd';
import PropTypes from 'prop-types';

import TagPicker from './TagPicker';

const { TextArea } = Input;

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
// Modal for adding and editing tags
//------------------------------------------------------------------------------
class ProjectAddModal extends Component {
  //----------------------------------------------------------------------------
  // Property types
  //----------------------------------------------------------------------------
  static propTypes = {
    onAdd: PropTypes.func
  }

  state = {
    title: '',
    selectedTags: [],
    description: ''
  }

  //----------------------------------------------------------------------------
  // Modal manipulators
  //----------------------------------------------------------------------------
  show = () => {
    this.setState({
      visible: true,
      title: '',
      selectedTags: [],
      description: ''
    });
  }

  handleOk = (e) => {
    if (this.props.onAdd) {
      this.props.onAdd(this.state.title,
                       this.state.selectedTags,
                       this.state.description);
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
    return (
      <Modal
        title='Add Project'
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
              onChange={event => this.setState({title: event.target.value})}
              placeholder='Title'
            />
          </div>
          <div className='dialogItem'>
            <TagPicker
              value={this.state.selectedTags}
              onChange={event => this.setState({selectedTags: event})}
            />
          </div>
          <div className='dialogItem'>
            <TextArea
              rows={15}
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

export default ProjectAddModal;
