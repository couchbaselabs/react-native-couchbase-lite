'use strict';

import Couchbase from 'react-native-couchbase-lite';

export default class Feed {
  constructor(seq, callback) {
    this.getChanges(seq, callback);
  }
  getChanges(seq, callback) {
    Couchbase.initRESTClient(manager => {
      var req = manager.query.get_db_changes({db: DB_NAME, include_docs: true, feed: 'longpoll', since: seq})
        .then(res => {
          if (!this.stopped) {
            callback();
            this.getChanges(res.obj.last_seq, callback);
          }
        })
        .catch(e => console.log('ERROR', e));
    });
  }
  stop() {
    this.stopped = true;
  }
}
