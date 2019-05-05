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

//------------------------------------------------------------------------------
// Tab picker
//------------------------------------------------------------------------------
class TagPicker extends Component {
  static propTypes = {
    value: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func
  }

  mapToIds = names => {
    return names
      .map(name => this.props.nameToId[name]);
  }

  mapToNames = ids => {
    return ids
      .map(id => this.props.idToName[id]);
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
        <Select.Option key={tag.key} value={tag.name} title={tag.name}>
        <span style={{color: tag.color}}>{tag.name}</span>
        </Select.Option>
    );

    return (
      <div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select tags..."
          value={this.mapToNames(this.props.value)}
          onChange={(event) => this.props.onChange(this.mapToIds(event))}
        >
          {options}
        </Select>
      </div>
    );
  }
}

//------------------------------------------------------------------------------
// Swap keys with names
//------------------------------------------------------------------------------
function buildNameToId(input) {
  var ret = {};
  for(var key in input){
    ret[input[key].name] = Number(key);
  }
  return ret;
}

function buildIdToName(input) {
  var ret = {};
  for(var key in input){
    ret[Number(key)] = input[key].name;
  }
  return ret;
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

  let nameToId = buildNameToId(state.tags);
  let idToName = buildIdToName(state.tags);
  return {
    tags,
    nameToId,
    idToName
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TagPicker);
