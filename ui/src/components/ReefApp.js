//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 02.12.2018
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import ReefNav from './ReefNav';
import ProjectList from './ProjectList';
import TagList from './TagList';
import WrongRoute from './WrongRoute';

class ReefApp extends Component {
  render() {
    return (
      <div>
        <ReefNav />
        <Switch>
          <Route exact path='/' component={ProjectList} />
          <Route exact path='/projects' component={ProjectList} />
          <Route exact path='/tags' component={TagList} />
          <Route component={WrongRoute} />
        </Switch>
      </div>
    );
  }
}

export default ReefApp;
