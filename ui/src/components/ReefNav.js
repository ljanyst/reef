//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

const styles = {
  logo: {
    float: 'left',
    marginLeft: '12%',
    fontSize: 'x-large'
  }
};

class ReefNav extends Component {
  state = {
    current: 'mail'
  }

  handleClick = (e) => {
    this.setState({
      current: e.key
    });
  }

  render() {
    return (
      <Menu
        theme='dark'
        style={{textAlign: 'right'}}
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
        >
        <Menu.SubMenu
          style={styles.logo}
          title={<span className="Title">Reef</span>}>
        </Menu.SubMenu>
        <Menu.Item key="projects">
          <Link to='/projects'>
            <Icon type="project" />Projects
          </Link>
        </Menu.Item>
        <Menu.Item key="tags" style={{marginRight: '12%'}}>
          <Link to='/tags'>
            <Icon type="tag" />Tags
          </Link>
        </Menu.Item>
      </Menu>
    );
  }
}

export default ReefNav;
