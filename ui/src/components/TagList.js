//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Icon, Tag, Table, message } from 'antd';
import { connect } from 'react-redux';
import sortBy from 'sort-by';

import { BACKEND_OPENED } from '../actions/backend';
import TagEditorModal from './TagEditorModal';
import { tagNew, tagDelete } from '../utils/backendActions';
import { minutesToHours } from '../utils/helpers';

class TagList extends Component {
  showTagEdit = () => {
    this.tagEditor.show();
  }

  onTagAdd = (name, color) => {
    tagNew(name, color)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  onTagDelete = (name) => {
    tagDelete(name)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
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
          <Button
            icon='edit'
            disabled={!this.props.connected}
            onClick={() => {}} />
          <Button
            icon='delete'
            disabled={!this.props.connected}
            onClick={() => this.onTagDelete(record.tag.name)} />
        </Button.Group>
      )
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
          <Button
            disabled={!this.props.connected}
            onClick={this.showTagEdit}
            size='small'>
            <Icon type='plus' /> Add tag
          </Button>
        </div>
        <div>
          <Table
            columns={columns}
            dataSource={this.props.tags}
            size='small'
            pagination={false}
            />
        </div>
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
          tag: {name: obj.name, color: obj.color},
          hoursTotal: minutesToHours(obj.minutesTotal),
          hoursYear: minutesToHours(obj.minutesYear),
          hoursMonth: minutesToHours(obj.minutesMonth),
          numProjects: obj.numProjects
        };
      });

  return {
    tags,
    connected: state.backend.status === BACKEND_OPENED
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
