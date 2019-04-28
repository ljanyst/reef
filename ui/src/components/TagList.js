//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Button, Icon, Tag, Table, Popconfirm, message } from 'antd';
import { connect } from 'react-redux';
import sortBy from 'sort-by';

import { BACKEND_OPENED } from '../actions/backend';
import TagEditorModal from './TagEditorModal';
import { tagNew, tagDelete, tagEdit } from '../utils/backendActions';
import { minutesToHours } from '../utils/helpers';

class TagList extends Component {
  showTagAdd = (id, name, color) => {
    this.tagAdder.show(id, name, color);
  }

  showTagEdit = (id, name, color) => {
    this.tagEditor.show(id, name, color);
  }

  onTagAdd = (id, name, color) => {
    tagNew(name, color)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  onTagEdit = (id, name, color) => {
    tagEdit(id, name, color)
      .catch(error => {
        setTimeout(() => message.error(error.message), 500);
      });
  }

  onTagDelete = (id) => {
    tagDelete(id)
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
      render: (_, record) => {
        var deleteButton = (
          <Popconfirm
            placement="topRight"
            title={`Are you sure you want to delete '${record.tag.name}'`}
            onConfirm={() => this.onTagDelete(record.key)}
            okText="Yes"
            cancelText="No">
            <Button icon='delete'/>
          </Popconfirm>
        );
        if (!this.props.connected) {
          deleteButton = (<Button icon='delete' disabled={true} />);
        }
        return (
          <Button.Group size="small">
            <Button
              icon='edit'
              disabled={!this.props.connected}
              onClick={
                () => {
                  this.showTagEdit(record.key,
                                   record.tag.name,
                                   record.tag.color);
                }
              }/>
            {deleteButton}
          </Button.Group>
        );
      }
    }];

    return (
      <div className='col-md-8 col-md-offset-2 app-container'>
        <TagEditorModal
          ref={(el) => { this.tagAdder = el; }}
          onSuccess={this.onTagAdd}
          title='Add tag' />
        <TagEditorModal
          ref={(el) => { this.tagEditor = el; }}
          onSuccess={this.onTagEdit} />
        <h2>Tags</h2>
        <div className='control-button-container'>
          <Button
            disabled={!this.props.connected}
            onClick={() => this.showTagAdd(null, null, null)}
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
          hoursTotal: minutesToHours(obj.durationTotal),
          hoursYear: minutesToHours(obj.durationYear),
          hoursMonth: minutesToHours(obj.durationMonth),
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
