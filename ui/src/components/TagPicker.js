//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import sortBy from 'sort-by';
import PropTypes from 'prop-types';

class TagPicker extends Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func
  }

  constructor(props) {
    super();
    this.state = {
      selectedTags: props.value
    };
  }

  render() {
    const options = this.props.tags.map(
      tag =>
        <Select.Option key={tag.key} value={tag.key} title={tag.name}>
        <span style={{color: tag.color}}>{tag.name}</span>
        </Select.Option>
    );

    return (
      <div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select tags..."
          value={this.props.value}
          onChange={(event) => this.props.onChange(event)}
        >
          {options}
        </Select>
      </div>
    );
  }
}

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  let tags = Object.keys(state.tags)
      .map(key => state.tags[key])
      .sort(sortBy('name'))
      .map(obj => {
        return {
          key: obj.id,
          name: obj.name,
          color: obj.color
        };
      });

  return {
    tags
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TagPicker);
