//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 15.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';

import { Hue, Saturation } from 'react-color/lib/components/common';
import { Input, Tag, Modal } from 'antd';
import color from 'react-color/lib/helpers/color';
import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';

//------------------------------------------------------------------------------
// Style
//------------------------------------------------------------------------------
const styles = {
  saturation: {
    height: '200px',
    position: 'relative',
    border: 'solid 1px LightGray',
    marginBottom: '1em'
  },
  hue: {
    height: '10px',
    position: 'relative',
    marginBottom: '1em'
  },
  elem: {
    marginBottom: '1em'
  },
  center: {
    textAlign: 'center'
  },
  result_element: {
    lineHeight: 'normal',
    verticalAlign: 'bottom',
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
// Check if given color string is valid
//------------------------------------------------------------------------------
const isColorValid = color => {
  return String(color).charAt(0) === '#' && color.length === 7 && tinycolor(color).isValid();
};

//------------------------------------------------------------------------------
// Modal for adding and editing tags
//------------------------------------------------------------------------------
class TagEditorModal extends Component {
  //----------------------------------------------------------------------------
  // Property types
  //----------------------------------------------------------------------------
  static propTypes = {
    color: PropTypes.string,
    title: PropTypes.string,
    onSuccess: PropTypes.func
  }

  //----------------------------------------------------------------------------
  // Set up the object
  //----------------------------------------------------------------------------
  constructor(props) {
    super();
    const colorState = color.toState(props.color ? props.color : '#ff8b00');
    const title = props.title ? props.title : "Edit tag";
    this.state = {
      name: 'TagName',
      visible: false,
      hexInputValue: colorState.hex,
      title,
      ...colorState
    };
  }

  //----------------------------------------------------------------------------
  // Modal manipulators
  //----------------------------------------------------------------------------
  show = (id, name, color) => {
    var state = {
      visible: true
    };

    if (color && isColorValid(color)) {
      this.setColor(color);
    }

    if (name) {
      state = {
        name,
        id,
        ...state
      };
    }
    this.setState(state);
  }

  handleOk = (e) => {
    if (this.props.onSuccess) {
      this.props.onSuccess(this.state.id, this.state.name, this.state.hex);
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
  // Color manipulators
  //----------------------------------------------------------------------------
  setColor = (data) => {
    const colorState = color.toState(data, data.h);
    this.setState({
      hexInputValue: colorState.hex,
      ...colorState
    });
  }

  onColorChange = (data, event) => {
    this.setColor(data);
  };

  onNameChange = (event) => {
    this.setState({name: event.target.value});
  };

  onHexChange = (event) => {
    const color = event.target.value;
    this.setState({hexInputValue: color});
    if (isColorValid(color)) {
      this.setColor(color);
    }
  };

  //----------------------------------------------------------------------------
  // Render the component
  //----------------------------------------------------------------------------
  render() {
    return (
      <Modal
        title={this.state.title}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width='400px'
        >
        <div style={styles.content}>
          <div style={styles.saturation}>
            <Saturation
              hsl={this.state.hsl}
              hsv={this.state.hsv}
              onChange={this.onColorChange}
              />
          </div>
          <div style={styles.hue}>
            <Hue hsl={this.state.hsl} onChange={this.onColorChange} />
          </div>
          <div style={styles.elem}>
            <Input
              value={this.state.hexInputValue}
              style={styles.center}
              onChange={this.onHexChange}
              />
          </div>
          <div style={styles.elem}>
            <Input
              value={this.state.name}
              style={styles.center}
              onChange={this.onNameChange}
              />
          </div>
          <div>
            <div style={styles.result_element}>Result:</div>
            <div style={styles.result_element}>
              <Tag color={this.state.hex}>{this.state.name}</Tag>
                </div>
          </div>
        </div>
      </Modal>
    );
  };
}

export default TagEditorModal;
