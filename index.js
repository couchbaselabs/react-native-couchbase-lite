import {NativeModules} from "react-native";
import Swagger from "swagger-client";
import spec from "./spec.json";

const ReactCBLite = NativeModules.ReactCBLite;

let manager, callback;

ReactCBLite.init(url => {
  spec.host = url.split('/')[2];

  new Swagger({spec: spec, usePromise: true})
    .then(client => {
      manager = client;
      if (typeof callback == 'function') {
        callback(manager);
      }
    });
});

const rncblite = function (cb) {
  if (typeof manager !== 'undefined') {
    cb(manager); // If manager is already defined then don't wait
  } else {
    callback = cb;
  }
};

module.exports = {rncblite, ReactCBLite};