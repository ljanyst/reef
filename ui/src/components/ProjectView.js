//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import {
  Card, Button, Tag, Tooltip, Icon, Progress, Table, Empty, Popconfirm, message,
  Input
} from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import TagPicker from './TagPicker';
import { BACKEND_OPENED } from '../actions/backend';
import {
  projectGet, projectDelete, projectEdit
} from '../utils/backendActions';
import { projectSet } from '../actions/project';
import { minutesToString } from '../utils/helpers';

const { TextArea } = Input;

const styles = {
  text: {
    marginBottom: '1em',
    marginLeft: '1em',
    marginRight: '1em'
  },
  tooltipTableLabel: {
    paddingRight: '0.5em',
    textAlign: 'right'
  },
  tooltipTableValue: {
    textAlign: 'left'
  },
  sectionSeparator: {
    background: '#ededed',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    marginTop: '2em',
    marginBottom: '2em',
    paddingLeft: '1em',
    fontWeight: 'bold'
  },
  workSessionNumber: {
    borderRight: '1px solid LightGray',
    color: 'Gray',
    textAlign: 'right',
    width: '4em',
    maxWidth: '4em',
    marginRight: '1em',
    paddingRight: '0.5em',
    float: 'left'
  },
  infoPanel: {
    color: 'Gray',
    marginBottom: '1.5em'
  },
  titleEdit: {
    width: '80%',
    display: 'inline-block'
  }
};

class ProjectView extends Component {
  //----------------------------------------------------------------------------
  // The state
  //----------------------------------------------------------------------------
  state = {
    fetchError: null,
    edit: false
  }

  //----------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------
  fetchData = () =>
    projectGet(Number(this.props.match.params.id))
    .then(data => {
      this.setState({ fetchError: null });
      this.props.projectSet(data.payload);
    })
    .catch(error => this.setState({ fetchError: error.message }));

  deletePost = () => {
    projectDelete(Number(this.props.match.params.id))
      .then(data => this.props.history.push('/projects'))
      .catch(error => message.error(error.message));
  }

  //----------------------------------------------------------------------------
  // Mount the component
  //----------------------------------------------------------------------------
  componentDidMount() {
    this.setState({connected: this.props.connected});

    // We must wait for the backend web socket to connect
    if (this.props.connected) {
      this.fetchData();
    } else {
      setTimeout(this.fetchData, 1000);
    }
  }

  //----------------------------------------------------------------------------
  // Renderer
  //----------------------------------------------------------------------------
  render() {
    //--------------------------------------------------------------------------
    // Re-fetch the data on reconnection
    //--------------------------------------------------------------------------
    if (this.state.fetchError === 'Backend not connected.' &&
        this.props.connected) {
      this.fetchData();
    }

    //--------------------------------------------------------------------------
    // No data for this project
    //--------------------------------------------------------------------------
    if (Number(this.props.match.params.id) !== this.props.id) {
      var msg = "Loading the project data...";
      if (this.state.fetchError !== null) {
        msg = `Unable to fetch the project data: ${this.state.fetchError}`;
      }

      return (
        <div className='col-md-6 col-md-offset-3 app-container'>
          <Card>
            <Empty description={msg} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        </div>
      );
    }

    //--------------------------------------------------------------------------
    // Title
    //--------------------------------------------------------------------------
    var title = this.props.title;
    if (this.state.edit) {
      title = (
        <div style={styles.titleEdit} >
          <Input
            size="small"
            value={this.state.title}
            onChange={(event) => this.setState({title: event.target.value})}
          />
        </div>
      );
    }

    //--------------------------------------------------------------------------
    // Title buttons
    //--------------------------------------------------------------------------
    var deleteButton = (
      <Popconfirm
        placement="topRight"
        title={`Are you sure you want to delete '${this.props.title}'`}
        onConfirm={() => this.deletePost()}
        okText="Yes"
        cancelText="No">
        <Button icon='delete'/>
      </Popconfirm>
    );

    if (!this.props.connected) {
      deleteButton = (<Button icon='delete' disabled={true} />);
    }

    var titleButtons = (
      <Button.Group size="small">
        <Button
          icon='edit'
          disabled={!this.props.connected}
          onClick = {() => this.setState({
            edit: true,
            title: this.props.title,
            selectedTags: this.props.tags,
            description: this.props.description
          })}
        />
        {deleteButton}
      </Button.Group>
    );

    if (this.state.edit) {
      titleButtons = (
        <Button.Group size="small">
          <Button
            icon='save'
            disabled={!this.props.connected}
            onClick = {() => {
              projectEdit(this.props.id, this.state.title,
                          this.state.description, this.state.selectedTags)
                .catch(error => message.error(error.message));;
              this.setState({edit: false});
            }}>
            Save
            </Button>
        </Button.Group>
      );
    }

    //--------------------------------------------------------------------------
    // Card title
    //--------------------------------------------------------------------------
    const cardTitle = (
      <div>
        {title}
        <div style={{float: 'right'}}>
          {titleButtons}
        </div>
      </div>
    );

    //--------------------------------------------------------------------------
    // Tooltip
    //--------------------------------------------------------------------------
    const timeTooltip = (
      <table>
        <tbody>
          <tr>
            <td style={styles.tooltipTableLabel}>This month:</td>
            <td style={styles.tooltipTableValue}>
              {minutesToString(this.props.durationMonth)}
            </td>
          </tr>
          <tr>
            <td style={styles.tooltipTableLabel}>This week:</td>
            <td style={styles.tooltipTableValue}>
              {minutesToString(this.props.durationWeek)}
            </td>
          </tr>
        </tbody>
      </table>
    );

    //--------------------------------------------------------------------------
    // Info line
    //--------------------------------------------------------------------------
    var infoLine = (
      <div style={{marginBottom: '1.5em', color: 'Gray'}}>
        <Tooltip placement="right" title={timeTooltip}>
          <div style={{display: 'inline-block'}}>
            Time spent: <b>{minutesToString(this.props.durationTotal)}</b>
          </div>
        </Tooltip>
        <div style={{float: 'right'}}>
          <Tag color='#5243aa'>Purple</Tag>
          <Tag color='#ff8b00'>Orange</Tag>
          <Tag color='#0052cc'>Blue</Tag>
        </div>
      </div>
    );
    if (this.state.edit) {
      infoLine = (
        <div style={{marginBottom: '1em'}}>
          <TagPicker
            value={this.state.selectedTags}
            onChange={event => this.setState({selectedTags: event})}
          />
        </div>
      );
    }

    //--------------------------------------------------------------------------
    // Description
    //--------------------------------------------------------------------------
    var description = this.props.description;
    if (this.state.edit) {
      description = (
        <TextArea
          rows={5}
          value={this.state.description}
          onChange={(event) => this.setState({description: event.target.value})}
        />
      );
    }

    //--------------------------------------------------------------------------
    // Task columns
    //--------------------------------------------------------------------------
    const taskColumns = [{
      dataIndex: 'key',
      render: (_, record) => (
        <div>
          {record.description}
          <div style={{float: 'right'}}>
            <Button.Group size="small">
              <Button icon='check-circle' disabled={!this.props.connected} />
              <Button icon='edit' disabled={!this.props.connected}
                />
              <Button icon='delete' disabled={!this.props.connected} />
            </Button.Group>
          </div>
        </div>)
    }];

    const taskData =[{
      key: 'asdf1',
      description: 'Item 1'
    }, {
      key: 'asdf2',
      description: 'Item 2'
    }, {
      key: 'asdf3',
      description: 'Item 3'
    }];

    const sessionColumns = [{
      dataIndex: 'key',
      render: (_, record) => (
        <div>
          <div style={styles.workSessionNumber}>
            {record.key}.
          </div>
          <div>
            {record.data}.
            <div style={{float: 'right'}}>
              <Button.Group size="small">
                <Button icon='delete' disabled={!this.props.connected} />
              </Button.Group>
            </div>
          </div>
        </div>
      )}];

    const sessionData = [{
      key: '1',
      data: 'Worked for <b>2 hour and 2 minutes</b> on Wednesday, December 14, 2018.'
    }, {
      key: '2',
      data: 'Worked for <b>3 hours and 25 minutes</b> on Thursday, December 14, 2018.'
    },  {
      key: '12343',
      data: 'Worked for <b>4 hours and 45 minutes</b> on Friday, December 17, 2018.'
    }];

    //--------------------------------------------------------------------------
    // Render the whole thing
    //--------------------------------------------------------------------------
    return (
      <div className='col-md-6 col-md-offset-3 app-container'>
        <Card title={cardTitle}>
          <div style={styles.text}>
            {infoLine}
            <div>
              {description}
            </div>
          </div>
          <div style={styles.sectionSeparator}>Tasks</div>
          <div className='control-button-container'>
            <Button size='small'>
              <Icon type='plus' /> Add task
            </Button>
          </div>
          <div style={{margin: '1em'}}>
            <Progress percent={50} />
          </div>
          <Table
            showHeader={false}
            columns={taskColumns}
            dataSource={taskData}
            size='small'
            pagination={false}
            />
          <div style={styles.sectionSeparator}>Work sessions</div>
          <div className='control-button-container'>
            <Button size='small'>
              <Icon type='plus' /> Add session
            </Button>
          </div>
          <Table
            showHeader={false}
            columns={sessionColumns}
            dataSource={sessionData}
            size='small'
            pagination={false}
            />
        </Card>
      </div>
    );
  }
}

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  const id = Number(ownProps.match.params.id);
  var mapped = {
    connected: state.backend.status === BACKEND_OPENED
  };

  if (id === state.project.id) {
    const st = {
      ...mapped,
      ...state.project
    };
    return st;
  }
  return mapped;
}

function mapDispatchToProps(dispatch) {
  return {
    projectSet: (project) => dispatch(projectSet(project))
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectView));
