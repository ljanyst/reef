//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Icon, Tag, message } from 'antd';
import { connect } from 'react-redux';
import sortBy from 'sort-by';

import { BACKEND_OPENED } from '../actions/backend';
import TagPicker from './TagPicker';
import ProjectAddModal from './ProjectAddModal';
import { projectNew } from '../utils/backendActions';

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
    projectNew(name)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  showAddDialog = () => {
    this.addDialog.show();
  }

  render() {
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
        </div>
      )
    }];

    const list = (
      <Table
        showHeader={false}
        columns={columns}
        dataSource={this.props.summaries}
        size='small'
        pagination={false}
        />
    );

    return (
      <div className='col-md-8 col-md-offset-2 app-container'>
        <h2>Projects</h2>
        <ProjectAddModal
          ref={(el) => { this.addDialog = el; }}
          onAdd={this.addProject}
          title='Add project'
          />
        <div className='control-button-container'>
          <Button
            onClick={this.showAddDialog}
            disabled={!this.props.connected}
            size='small'>
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

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  let summaries = Object.keys(state.summaries)
      .map(key => state.summaries[key])
      .sort(sortBy('title'))
      .map(obj => {
        return {
          key: obj.id,
          title: obj.title,
          tags: obj.tags
            .map(key => state.tags[key])
            .sort(sortBy('name')),
          progress: 0.92
        };
      });

  return {
    summaries,
    connected: state.backend.status === BACKEND_OPENED
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
