import React, { Component } from 'react';
import {
  ListView,
} from 'react-native';

import Task from './task';


export default class List extends Component {
  render() {
    return (
      <ListView
        style={this.props.style}
        dataSource={this.props.data}
        renderRow={(rowData, sectionID, rowID, highlightRow) => <Task key={rowID} data={rowData} />}
        enableEmptySections
      />
    )
  }
}
