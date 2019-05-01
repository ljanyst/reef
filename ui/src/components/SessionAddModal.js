//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 01.05.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import moment from 'moment';

import { Modal, TimePicker, DatePicker } from 'antd';
import PropTypes from 'prop-types';

//------------------------------------------------------------------------------
// Style
//------------------------------------------------------------------------------
const styles = {
  element: {
    lineHeight: 'normal',
    margin: '0.5em',
    display: 'inline-block'
  },
  content: {
    margin: 'auto',
    width: '320px',
    textAlign: 'center'
  }
};

//------------------------------------------------------------------------------
// Modal for adding work sessions
//------------------------------------------------------------------------------
class SessionAddModal extends Component {
  //----------------------------------------------------------------------------
  // Property types
  //----------------------------------------------------------------------------
  static propTypes = {
    onAdd: PropTypes.func
  }

  //----------------------------------------------------------------------------
  // Set up the object
  //----------------------------------------------------------------------------
  constructor(props) {
    super();
    this.state = {
      duration: null,
      date: null,
      visible: false
    };
  }

  //----------------------------------------------------------------------------
  // Modal manipulators
  //----------------------------------------------------------------------------
  show = () => {
    var state = {
      visible: true
    };
    this.setState(state);
  }

  handleOk = (e) => {
    if (this.props.onAdd) {
      const duration = this.state.duration;
      const d = Number(duration.format('H')) * 60 + Number(duration.format('m'));
      this.props.onAdd(d, this.state.date.unix());
    }
    this.setState({
      visible: false
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false
    });
  }

  //----------------------------------------------------------------------------
  // Render the component
  //----------------------------------------------------------------------------
  render() {
    const dateFormat = 'YYYY/MM/DD';

    return (
      <Modal
        title='Add work session'
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width='370px'
        okButtonProps={{ disabled: !this.state.duration || !this.state.date }}
      >
        <div style={styles.content}>
          <div>
            <div style={styles.element}>
              <TimePicker
                style={{width: '250px'}}
                defaultOpenValue={moment('00:01', 'HH:mm')}
                value={this.state.duration}
                format='HH:mm'
                placeholder='Select duration'
                onChange={(duration) => this.setState({duration})}
                disabledMinutes={(hours) => {
                  if (hours === 0) {
                    return [0];
                  }
                  return [];
                }}
              />
            </div>
          </div>
          <div>
            <div style={styles.element}>
              <DatePicker
                defaultOpenValue={moment().format(dateFormat)}
                format={dateFormat}
                value={this.state.date}
                onChange={(date) => this.setState({date})}
                style={{width: '250px'}} />
            </div>
          </div>
        </div>
      </Modal>
    );
  };
}

export default SessionAddModal;
