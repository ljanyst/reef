//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Icon, Tag, Table } from 'antd';

import TagEditorModal from './TagEditorModal';

class TagList extends Component {
  showTagEdit = () => {
    this.tagEditor.show();
  }

  onTagAdd = (name, color) => {
    console.log(name, color);
  }

  render() {
    const columns = [{
      title: 'Tag',
      dataIndex: 'tag',
      render: tag => <Tag color={tag.color}>{tag.name}</Tag>
    }, {
      title: '# projects',
      align: 'right',
      dataIndex: 'numProjects'
    }, {
      title: 'Hours (total)',
      align: 'right',
      dataIndex: 'hoursTotal'
    }, {
      title: 'Hours (past year)',
      align: 'right',
      dataIndex: 'hoursYear'
    }, {
      title: 'Hours (past month)',
      align: 'right',
      dataIndex: 'hoursMonth'
    }, {
      title: 'Action',
      align: 'right',
      render: (_, record) => (
        <Button.Group size="small">
          <Button icon='edit' />
          <Button icon='delete' />
        </Button.Group>
      )
    }];

    const data = [{
      key: '1',
      tag: {name: 'Purple', color: '#5243aa'},
      numProjects: 21,
      hoursTotal: '3423:44',
      hoursYear: '423:44',
      hoursMonth: '23:44'
    }, {
      key: '2',
      tag: {name: 'Orange', color: '#ff8b00'},
      numProjects: 32,
      hoursTotal: '3423:34',
      hoursYear: '323:44',
      hoursMonth: '13:44'
    }, {
      key: '3',
      tag: {name: 'Blue', color: '#0052cc'},
      numProjects: 4,
      hoursTotal: '2423:34',
      hoursYear: '223:44',
      hoursMonth: '3:44'
    }, {
      key: '4',
      tag: {name: 'Green', color: '#36b37e'},
      numProjects: 5,
      hoursTotal: '1423:34',
      hoursYear: '123:44',
      hoursMonth: '2:44'
    }, {
      key: '5',
      tag: {name: 'Ocean', color: '#00b8d9'},
      numProjects: 2,
      hoursTotal: '423:34',
      hoursYear: '23:44',
      hoursMonth: '1:44'
    }, {
      key: '6',
      tag: {name: 'Yellow', color: '#ffc400'},
      numProjects: 1,
      hoursTotal: '323:34',
      hoursYear: '13:44',
      hoursMonth: '0:44'
    }, {
      key: '7',
      tag: {name: 'Forest', color: '#00875a'},
      numProjects: 1,
      hoursTotal: '223:34',
      hoursYear: '3:44',
      hoursMonth: '0:34'
    }];
    return (
      <div className='col-md-8 col-md-offset-2 app-container'>
        <TagEditorModal
          ref={(el) => { this.tagEditor = el; }}
          onSuccess={this.onTagAdd}
          title='Add tag'
          />
        <h2>Tags</h2>
        <div className='control-button-container'>
          <Button onClick={this.showTagEdit} size='small'>
            <Icon type='plus' /> Add tag
          </Button>
        </div>
        <div>
          <Table
            columns={columns}
            dataSource={data}
            size='small'
            pagination={false}
            />
        </div>
      </div>
    );
  }
}

export default TagList;
