//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 16.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';

import { Form, Input, Modal } from 'antd';
import PropTypes from 'prop-types';

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
    title: PropTypes.string,
    onAdd: PropTypes.func
  }

  state = {
    name: ''
  }

  //----------------------------------------------------------------------------
  // Modal manipulators
  //----------------------------------------------------------------------------
  show = () => {
    this.setState({visible: true});
  }

  handleOk = (e) => {
    if (this.props.onAdd) {
      this.props.onAdd(this.state.name);
    }
    this.setState({visible: false});
  }

  handleCancel = (e) => {
    this.setState({visible: false});
  }

  onNameChange = (event) => {
    this.setState({name: event.target.value});
  };

  //----------------------------------------------------------------------------
  // Render the component
  //----------------------------------------------------------------------------
  render() {
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 }
      },
      wrapperCol: {
        sm: { span: 17 }
      }
    };
    return (
      <Modal
        title='Add project'
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        >
        <div style={styles.content}>
          <Form>
            <Form.Item {...formItemLayout} label='Project Name'>
              <Input
                value={this.state.name}
                style={styles.center}
                onChange={this.onNameChange}
                />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };
}

export default ProjectAddModal;
