//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Select } from 'antd';

class TagPicker extends Component {
  render() {
    const tags = [
      { name: 'Ocean', color: '#00B8D9' },
      { name: 'Blue', color: '#0052CC '},
      { name: 'Purple', color: '#5243AA' },
      { name: 'Red', color: '#FF5630' },
      { name: 'Orange', color: '#FF8B00' },
      { name: 'Yellow', color: '#FFC400' },
      { name: 'Green', color: '#36B37E' },
      { name: 'Forest', color: '#00875A' },
      { name: 'Slate', color: '#253858' },
      { name: 'Silver', color: '#666666' },
    ];
    const options = tags.map(
      tag =>
        <Select.Option key={tag.name} value={tag.name} title={tag.name}>
        <span style={{color: tag.color}}>{tag.name}</span>
        </Select.Option>
    );

    return (
      <div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select tags..."
          >
          {options}
        </Select>
      </div>
    );
  }
}

export default TagPicker;
