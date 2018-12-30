//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Card, Button, Icon, Tag } from 'antd';

import TagPicker from './TagPicker';
import ProjectAddModal from './ProjectAddModal';

const styles = {
  progress: {
    float: 'right',
    marginLeft: '1em',
    paddingLeft: '0.5em',
    borderLeft: '1px solid LightGray',
    color: 'Gray',
    textAlign: 'right',
    width: '3.5em',
    maxWidth: '3.5em'
  }
};

class ProjectList extends Component {
  addProject = name => {
    console.log(name);
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  render() {
    var list = (
      <Card>
        <div style={{textAlign: 'center'}}>No projects.</div>
      </Card>
    );

    if (true) {
      const columns = [{
        dataIndex: 'key',
        render: (_, record) => (
          <div>
              <Link to={`project/${record.key}`}>
                {record.title}
              </Link>
              <div style={{float: 'right'}}>
                {
                  record.tags.map(tag => (
                    <Tag color={tag.color} key={tag.name}>{tag.name}</Tag>
                  ))
                }
                <div style={styles.progress}>{Math.floor(record.progress*100)}%</div>
              </div>
          </div>)
      }];

      const data =[{
        key: 'asdf1',
        title: 'Advanced Math - semester #1',
        tags: [
          {name: 'Purple', color: '#5243aa'},
          {name: 'Orange', color: '#ff8b00'},
          {name: 'Blue', color: '#0052cc'}
        ],
        progress: 0.92
      }, {
        key: 'asdf2',
        title: 'Structure and interpretation of computer programs',
        tags: [
          {name: 'Blue', color: '#0052cc'},
          {name: 'Orange', color: '#ff8b00'},
          {name: 'Green', color: '#36b37e'},
          {name: 'Ocean', color: '#00b8d9'}
        ],
        progress: 0.43
      }, {
        key: 'asdf3',
        title: 'Multiple view geometry',
        tags: [
          {name: 'Yellow', color: '#ffc400'},
          {name: 'Forest', color: '#00875a'},
        ],
        progress: 1.
      }];

      list = (
        <Table
          showHeader={false}
          columns={columns}
          dataSource={data}
          size='small'
          pagination={false}
          />
      );
    }

    return (
      <div className='col-md-8 col-md-offset-2 app-container'>
        <h2>Projects</h2>
        <ProjectAddModal
          ref={(el) => { this.addDialog = el; }}
          onAdd={this.addProject}
          title='Add project'
          />
        <div className='control-button-container'>
          <Button onClick={this.showAddDialog} size='small'>
            <Icon type='plus' /> Add project
          </Button>
        </div>
        <TagPicker/>
        <div style={{marginTop: '1em'}}>
          {list}
        </div>
      </div>
    );
  }
}

export default ProjectList;
