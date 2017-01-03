'use strict';

import React, {Component} from "react";
import {Text, View, ListView, StyleSheet, Image} from "react-native";
import Couchbase from 'react-native-couchbase-lite';
import CommonList from './../../CommonList';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class List extends Component {
  constructor() {
    super();
    this.state = {
      promptVisible: false
    };
  }
  componentWillMount() {
    Couchbase.initRESTClient(manager => {
      this.manager = manager;
    });
  }
  onRowPressed(row) {
    const manager = this.manager;
    row.doc.complete = !row.doc.complete;
    manager.document.put({db: DB_NAME, doc: row.id, body: row.doc});
  }
  createTask(text) {
    var doc = {task: text, complete: false, createdAt: new Date(), type: 'task', taskList: {id: this.props.id, owner: this.props.owner}};
    this.manager.document.post({db: DB_NAME, body: doc});
  }
  updateTask(text, doc) {
    doc.task = text;
    this.manager.document.put({db: DB_NAME, doc: doc._id, body: doc});
  }
  deleteTask(data) {
    this.manager.document.delete({db: DB_NAME, doc: data.doc._id, rev: data.doc._rev});
  }
  isComplete(row) {
    if (row.doc.complete) {
      return {}
    } else {
      return {height: 0}
    }
  }
  render() {
    return (
      <CommonList
        title="Task"
        dataSource={this.props.data}
        onCreate={(name) => this.createTask(name)}
        onDelete={(data) => this.deleteTask(data)}
        onSubmit={(name, doc) => this.updateTask(name, doc)}
        onRowPressed={(row) => this.onRowPressed(row)}
        renderRow={(row, sectionID, rowID, highlightRow) => {
          return (
            <View style={styles.rowContainer}>
              <Image
                source={{uri: row.url}}
                style={styles.rowThumbnail}/>
              <Text style={styles.rowTitle}>{row.key[2]}</Text>
              <Icon style={[styles.rowCheckmark, this.isComplete(row)]} name="check" size={20} color="black" />
            </View>
          )
        }} />
    )
  }
}

const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  rowThumbnail: {
    width: 53,
    height: 81,
    flex: 0,
  },
  rowTitle: {
    fontSize: 20,
    padding: 15,
    flex: 1,
  },
  rowCheckmark: {
    flex: 0,
    marginRight: 20,
  },
});
