'use strict';

import {AppState, NativeModules} from "react-native";
import Swagger from "swagger-client";
import spec from "./spec.json";
import base64 from 'base-64';
const Couchbase = NativeModules.ReactCBLite;

let manager, callback;

Couchbase.init(url => {
  spec.host = url.split('/')[2];

  new Swagger({spec: spec, usePromise: true})
    .then(client => {
      var encodedCredentials = "Basic " + base64.encode(url.split("//")[1].split('@')[0]);
      client.clientAuthorizations.add("auth", new Swagger.ApiKeyAuthorization('Authorization', encodedCredentials, 'header'));
      manager = client;
      if (typeof callback == 'function') {
        callback(manager);
      }
    });

  // stop and start are needed because the OS appears to kill the listener when the app
  // becomes inactive (when the screen is locked, or its put in the background)
  AppState.addEventListener('change', (appState) => {
    if (String(appState).match(/inactive|background/)) {
      Couchbase.stopListener();
    } else if (String(appState).match(/active/)) {
      Couchbase.startListener();
    }
  });
});

Couchbase.initRESTClient = function (cb) {
  if (typeof manager !== 'undefined') {
    cb(manager); // If manager is already defined, don't wait.
  } else {
    callback = cb;
  }
};

module.exports = Couchbase;