'use strict';

import React, {Component} from 'react';
import {ListView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import CommonList from './../../CommonList';
import Couchbase from 'react-native-couchbase-lite';

export default class Users extends Component {

  componentWillMount() {
    Couchbase.initRESTClient(manager => {
      this.manager = manager;
    })
  }

  inviteUser(name) {
    var doc = {taskList: {id: this.props.id, owner: this.props.owner}, type: 'task-list.user', username: name, _id: `${this.props.id}.${name}`};
    this.manager.document.post({db: DB_NAME, body: doc});
  }

  deleteUser(data) {
    this.manager.document.delete({db: DB_NAME, doc: data.doc._id, rev: data.doc._rev});
  }

  render() {
    return (
      <CommonList
        title="List"
        dataSource={this.props.data}
        onCreate={(name) => this.inviteUser(name)}
        onDelete={(data) => this.deleteUser(data)}
        onSubmit={(name, doc) => null}
        onRowPressed={(row) => null}
        renderRow={(data, sectionID, rowID, highlightRow) => {
          return (
            <View style={styles.rowContainer}>
              <Text style={styles.rowTitle}>
                {data.key[1]}
              </Text>
            </View>
          )
        }}/>
    );
  }
};

const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  rowTitle: {
    fontSize: 30,
    padding: 15,
    flex: 1,
  },
});
