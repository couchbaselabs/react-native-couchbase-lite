import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
} from 'react-native';

import Couchbase from 'react-native-couchbase-lite';

import List from './components/list';

const SG_URL = 'http://localhost:4984/moviesapp';
const DB_NAME = 'todo';
const VIEWS = {
  views: {
    tasksByCreatedAt: {
      map: function (doc) {
        if (doc.type == 'task') {
          emit(doc.task, null);
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
    Couchbase.initRESTClient(manager => {
      Couchbase.installPrebuiltDatabase(DB_NAME);
      this.setState({manager: manager});
    });
  }
  
  render() {
    if (!this.state.manager) {
      return <View />
    } else {
      return (
          <View style={styles.container}>
            <App manager={this.state.manager} />   
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
      sequence: '',
      filteredMovies: '',
    };
  }

  setupDatabase() {
    let manager = this.props.manager;
    manager.database.put_db({db: DB_NAME})
      .then(res => this.setupQuery())
      .catch(e => console.log('ERROR', e));
  }
  
  setupViews(update) {
    let manager = this.props.manager;
    manager.query.get_db_design_ddoc({db: DB_NAME, ddoc: 'main'})
      .catch(e => {
        if (e.status == 404) {
          manager.query.put_db_design_ddoc({ddoc: 'main', db: DB_NAME, body: VIEWS})
            .then(res => {this.setupQuery()})
            .catch(e => console.log('ERROR', e));
        }
      })
      .then(res => {this.setupQuery()});
  }
  
  setupReplications() {
    let manager = this.props.manager;
    manager.server.post_replicate({body: {source: SG_URL, target: DB_NAME, continuous: true}})
      // .then(res => manager.server.post_replicate({source: DB_NAME, target: SG_URL, continuous: true}))
      .catch(e => console.log('ERROR', e));
  }
  
  setupQuery() {
    let manager = this.props.manager;
    manager.query.get_db_design_ddoc_view_view({db: DB_NAME, ddoc: 'main', view: 'tasksByCreatedAt', include_docs: true})
      .then(res => {
        let rows = res.obj.rows;
        for (var i = 0; i < rows.length; i++) {
          rows[i].url = 'http://' + manager.host + '/' + DB_NAME + '/' + rows[i].id + '/image';
        }
        this.setState({
          data: rows,
          dataSource: this.state.dataSource.cloneWithRows(rows),
        })
      })
      .catch(e => console.log('ERROR', e));
  }
  
  componentDidMount() {
    let manager = this.props.manager;
    manager.server.get_all_dbs()
      .then(res => {
        let dbs = res.obj;
        if (dbs.indexOf(DB_NAME) == -1) {
          this.setupDatabase();
        } else {
          this.setupViews();
          this.setupReplications();
        }
      })
      .catch(e => console.log('ERROR', e));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.seqTextLabel}>
          The database sequence: {this.state.sequence}
        </Text>
        { this.state.filteredMovies.length > 0 &&
          <Text>
            Movies published in 2004: {this.state.filteredMovies}
          </Text>
        }
        <List
          data={this.state.dataSource}
          style={styles.listView}
        />
      </View>
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
