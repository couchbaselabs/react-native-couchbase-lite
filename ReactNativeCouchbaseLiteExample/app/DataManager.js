'use strict';

import {Actions} from 'react-native-router-flux';
import Couchbase from 'react-native-couchbase-lite';

global.LOGIN_FLOW_ENABLED = false;
const SYNC_ENABLED = false;
const SG_HOST = 'localhost:4984/todo';
const USE_PREBUILT_DB = false;
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

var exports = module.exports = {
  init(client) {
    global.manager = client;
  },
  login(username, password) {
    this.startSession(username, password, null);
  },
  startSession(username, password, newPassword) {
    this.installPrebuiltDb();
    global.DB_NAME = username;
    this.startDatabaseOperations()
      .then(res => this.setupReplications(username, password))
    Actions.lists({owner: username});
  },
  setupDatabase() {
    manager.database.put_db({db: DB_NAME})
      .then(res => this.startDatabaseOperations())
      .catch(e => console.log('ERROR', e));
  },
  installPrebuiltDb() {
    if (USE_PREBUILT_DB) {
      Couchbase.installPrebuiltDatabase(DB_NAME);
    }
  },
  startDatabaseOperations() {
    return manager.database.get_db({db: DB_NAME})
      .then(res => {
        this.setupViews();
      })
      .catch(e => {
        if (e.status == 404) {
          this.setupDatabase();
        }
      });
  },
  setupViews() {
    manager.query.get_db_design_ddoc({db: DB_NAME, ddoc: 'main'})
      .catch(e => {
        if (e.status == 404) {
          manager.query.put_db_design_ddoc({ddoc: 'main', db: DB_NAME, body: VIEWS})
            .catch(e => console.log('ERROR', e));
        }
      })
      .then(() => {
        this.setupQuery()
      });
  },
  setupReplications(username, password) {
    const SG_URL = `http://${username}:${password}@${SG_HOST}`;
    return manager.server.post_replicate({body: {source: SG_URL, target: DB_NAME, continuous: true}})
      .then(res => manager.server.post_replicate({body: {source: DB_NAME, target: SG_URL, continuous: true}}))
      .catch(e => console.log('ERROR', e));
  },
};
