var {NativeModules} = require('react-native');
var ReactCBLite = NativeModules.ReactCBLite;

var Swagger = require('swagger-client');
var spec = require('./spec.json');

var manager, callback;
ReactCBLite.init(url => {
  spec.host = url.split('/')[2];
  new Swagger({ spec: spec, usePromise: true })
    .then(client => {
      manager = client;
      if(typeof callback == 'function'){
        callback(manager);
      }
    });
});

var rncblite = function(cb){
  if(typeof manager != 'undefined'){
    cb(manager);
  } else {
    callback = cb;
  }
};

module.exports = {rncblite, ReactCBLite};