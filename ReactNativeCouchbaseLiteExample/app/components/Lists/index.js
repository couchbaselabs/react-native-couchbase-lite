/* @flow */
'use strict';

import React, {Component} from 'react';
import {View, ListView, Text, StyleSheet} from 'react-native';
import Couchbase from 'react-native-couchbase-lite';
import {Actions} from 'react-native-router-flux';
import Feed from './../../Feed';
import CommonList from './../CommonList';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class Lists extends Component {
  constructor() {
    super();

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: [],
      dataSource: ds.cloneWithRows([]),
      counts: {},
    };
  }

  componentDidMount() {
    manager.database.get_db({db: DB_NAME})
      .then(res => {
        this.setupQuery();
        this.feed = new Feed(res.obj.update_seq, () => {
          this.setupQuery();
        });
      });
  }

  componentWillUnmount() {
    this.feed.stop();
  }

  setupQuery() {
    manager.query.get_db_design_ddoc_view_view({
      db: DB_NAME,
      ddoc: 'main',
      view: 'listsByName',
      include_docs: true
    })
      .then(res => {
        const rows = res.obj.rows;
        this.setState({
          data: rows,
          dataSource: this.state.dataSource.cloneWithRows(rows),
        });
        return
      });
    manager.query.get_db_design_ddoc_view_view({
      db: DB_NAME,
      ddoc: 'main',
      view: 'incompleteTasksCount',
      group_level: 1
    })
      .then(res => {
        const rows = res.obj.rows;
        var counts = {};
        for (var i = 0; i < rows.length; i++) {
          const row = rows[i];
          counts[row.key] = row.value;
        }
        this.setState({counts: counts});
      });
  }

  onRowPressed(task) {
    Actions.listdetail({list_id: task.doc._id, list_owner: task.doc.owner});
  }

  createList(text) {
    var doc = {owner: this.props.owner, name: text, type: 'task-list', _id: `${this.props.owner}.${Math.random().toString(36).substring(7)}`};
    manager.document.post({db: DB_NAME, body: doc});
  }

  updateList(text, doc) {
    doc.name = text;
    manager.document.put({db: DB_NAME, doc: doc._id, body: doc});
  }

  deleteList(data) {
    manager.document.delete({db: DB_NAME, doc: data.doc._id, rev: data.doc._rev});
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonList
          title="List"
          dataSource={this.state.dataSource}
          onCreate={(name) => this.createList(name)}
          onDelete={(name) => this.deleteList(name)}
          onSubmit={(name, doc) => this.updateList(name, doc)}
          onRowPressed={(row) => this.onRowPressed(row)}
          renderRow={(data, sectionID, rowID, highlightRow) => {
            return (
              <View style={styles.rowContainer}>
                <Text style={styles.rowTitle}>
                  {data.key}
                </Text>
                <Text style={styles.rowCount}>
                  {this.state.counts[data.id]}
                </Text>
                <Icon style={styles.accessoryType} name="angle-right" size={20} color="#5D737E" />
              </View>
            )
          }} />
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
  },
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
  rowCount: {
    flex: 0,
    fontSize: 20,
    paddingRight: 15,
  },
  accessoryType: {
    paddingRight: 10,
  }
});
