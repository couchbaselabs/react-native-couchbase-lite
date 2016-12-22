'use strict';

import React, {Component} from "react";
import {StyleSheet, Text, View, Image, ListView, TabBarIOS} from "react-native";
import Couchbase from "react-native-couchbase-lite";
import {Router, Scene} from 'react-native-router-flux';
import Lists from './components/Lists/index';
import ListDetail from './components/ListDetail/index';

const SG_URL = 'http://mod:pass@localhost:4984/todo';
var DB_NAME = 'todo';
global.DB_NAME = DB_NAME;
const VIEWS = {
  views: {
    listsByName: {
      map: function (doc) {
        if (doc.type == 'task-list') {
          emit(doc.name, null);
        }
      }.toString()
    },
    incompleteTasksCount: {
      map: function (doc) {
        if (doc.type == 'task' && !doc.complete) {
          emit(doc.taskList.id, null);
        }
      }.toString(),
      reduce: function(keys, values, rereduce) {
        return values.length;
      }.toString()
    },
    tasksByCreatedAt: {
      map: function (doc) {
        if (doc.type == 'task') {
          emit([doc.taskList.id, doc.createdAt, doc.task], null);
        }
      }.toString()
    },
    usersByUsername: {
      map: function (doc) {
        if (doc.type == 'task-list.user') {
          emit([doc.taskList.id, doc.username], null);
        }
      }.toString()
    }
  }
};

export default class Root extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    Couchbase.installPrebuiltDatabase(DB_NAME);
    Couchbase.initRESTClient(manager => {
      this.setState({manager: manager});
    });
  }

  render() {
    if (!this.state.manager) {
      return <View />
    } else {
      return (
        <View style={styles.container}>
          <App manager={this.state.manager}/>
        </View>
      )
    }
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      dataSource: ds.cloneWithRows([]),
      data: [],
      usersDataSource: ds.cloneWithRows([]),
      selectedTab: 'users'
    };
  }

  setupDatabase() {
    const manager = this.props.manager;
    manager.database.put_db({db: DB_NAME})
      .then(res => this.startDatabaseOperations())
      .catch(e => console.log('ERROR', e));
  }

  setupViews() {
    const manager = this.props.manager;
    manager.query.get_db_design_ddoc({db: DB_NAME, ddoc: 'main'})
      .catch(e => {
        if (e.status == 404) {
          manager.query.put_db_design_ddoc({ddoc: 'main', db: DB_NAME, body: VIEWS})
            .then(() => {
              this.setupQuery()
            })
            .catch(e => console.log('ERROR', e));
        }
      })
      .then(() => {
        this.setupQuery()
      });
  }

  setupReplications() {
    const manager = this.props.manager;
    manager.server.post_replicate({body: {source: SG_URL, target: DB_NAME, continuous: true}})
    // .then(res => manager.server.post_replicate({source: DB_NAME, target: SG_URL, continuous: true}))
      .catch(e => console.log('ERROR', e));
  }

  startDatabaseOperations() {
    const manager = this.props.manager;
    manager.database.get_db({db: DB_NAME})
      .then(res => {
        this.setupViews();
        this.setupReplications();
      })
      .catch(e => {
        if (e.status == 404) {
          this.setupDatabase();
        }
      });
  }

  componentDidMount() {
    this.startDatabaseOperations();
  }

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene
            key="lists"
            component={Lists}
            title="Lists" initial />
          <Scene
            key="listdetail"
            component={ListDetail}
            title="List Detail"/>
        </Scene>
      </Router>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  seqTextLabel: {
    textAlign: 'center',
    margin: 5
  },
  listView: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});
