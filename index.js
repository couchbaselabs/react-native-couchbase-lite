var {NativeModules} = require('react-native');
var Couchbase = NativeModules.ReactCBLite;

var Swagger = require('swagger-client');
var spec = require('./spec.json');

var manager, callback;
Couchbase.init(url => {
  spec.host = url.split('/')[2];
  new Swagger({ spec: spec, usePromise: true })
    .then(client => {
      manager = client;
      if(typeof callback == 'function'){
        callback(manager);
      }
    });
});

Couchbase.initRESTClient = function(cb){
  if(typeof foo != 'undefined'){
    cb(manager); // If manager is already define, don't wait.
  } else {
    callback = cb;
  }
};

module.exports = Couchbase;