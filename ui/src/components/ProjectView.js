//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 06.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Card, Button, Tag, Tooltip, Icon, Progress, Table } from 'antd';

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
  }
};

class ProjectView extends Component {
  render() {
    const timeTooltip = (
      <table>
        <tbody>
          <tr>
            <td style={styles.tooltipTableLabel}>This month:</td>
            <td style={styles.tooltipTableValue}>432 hours 41 minutes</td>
          </tr>
          <tr>
            <td style={styles.tooltipTableLabel}>This week:</td>
            <td style={styles.tooltipTableValue}>12 hours 11 minutes</td>
          </tr>
        </tbody>
      </table>
    );

    const title = (
      <div>
        Advanced Math #1
        <div style={{float: 'right'}}>
          <Button.Group size="small">
            <Button icon='edit' />
            <Button icon='delete' />
          </Button.Group>
        </div>
      </div>
    );

    const taskColumns = [{
      dataIndex: 'key',
      render: (_, record) => (
        <div>
          {record.description}
          <div style={{float: 'right'}}>
            <Button.Group size="small">
              <Button icon='check-circle' />
              <Button icon='edit' />
              <Button icon='delete' />
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
                <Button icon='delete' />
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

    return (
      <div className='col-md-6 col-md-offset-3 app-container'>
        <Card title={title}>
          <div style={styles.text}>
            <div style={{marginBottom: '1.5em', color: 'Gray'}}>
              <Tooltip placement="right" title={timeTooltip}>
                <div style={{display: 'inline-block'}}>
                  Time spent: <b>3212 hours 23 minues</b>
                </div>
              </Tooltip>
              <div style={{float: 'right'}}>
                <Tag color='#5243aa'>Purple</Tag>
                <Tag color='#ff8b00'>Orange</Tag>
                <Tag color='#0052cc'>Blue</Tag>
              </div>
            </div>
            <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            ac metus condimentum, venenatis lorem vel, blandit erat. Maecenas
            turpis justo, pulvinar at ipsum ut, aliquam finibus libero.
            Vestibulum viverra neque non egestas varius. Maecenas eget tellus
            quis ante interdum vulputate non eu lectus. Ut venenatis vulputate
            pulvinar. Pellentesque gravida dui risus, vitae bibendum sem
            fringilla a. Vivamus elementum massa non volutpat condimentum.
            Vivamus elementum, ex eu eleifend finibus, ex turpis ultricies nibh,
            sit amet fermentum odio lacus id ligula. Curabitur eget nisi massa.
            Morbi porttitor venenatis dui, sed consequat nulla mattis eget.
            Donec auctor massa enim. Sed aliquam molestie sem, non volutpat
            justo sodales sed. Nunc tincidunt, massa sit amet ornare commodo,
            arcu magna dictum augue, in dictum libero dui sed nisl.
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

export default ProjectView;
