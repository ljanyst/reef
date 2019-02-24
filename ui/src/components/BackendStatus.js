//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 24.02.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'antd';

import { backend } from '../utils/Backend';
import { BACKEND_CONNECTING, BACKEND_OPENED } from '../actions/backend';

//------------------------------------------------------------------------------
// Backend status
//------------------------------------------------------------------------------
class BackendStatus extends Component {
  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------
  render() {
    //--------------------------------------------------------------------------
    // We're okay
    //--------------------------------------------------------------------------
    if(this.props.status === BACKEND_OPENED)
      return (<div />);

    //--------------------------------------------------------------------------
    // Retrying
    //--------------------------------------------------------------------------
    if(this.props.status === BACKEND_CONNECTING)
      return (
        <div className='backend-alert col-md-4 col-md-offset-4'>
          <Alert message="Connecting..." type="info" showIcon />
        </div>
      );

    //--------------------------------------------------------------------------
    // Error
    //--------------------------------------------------------------------------
    const message = (
      <div>
        Disconnected. Connecting in
        <strong> {this.props.countdown}</strong>
        {this.props.countdown === 1 ? ' second' : ' seconds'}.
        Click <a className='alert-link' onClick={(evt) => {
            evt.preventDefault();
            backend.connect();
          }} href='#n'>here</a> to
        try now.
      </div>
    );
    return (
      <div className='backend-alert col-md-4 col-md-offset-4'>
        <Alert message={message} type="error" showIcon />
      </div>
    );
  }
}

//------------------------------------------------------------------------------
// The redux connection
//------------------------------------------------------------------------------
function mapStateToProps(state, ownProps) {
  return {
    status: state.backend.status,
    countdown: state.backend.countdown
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendStatus);
