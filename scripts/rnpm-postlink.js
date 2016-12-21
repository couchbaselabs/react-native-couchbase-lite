#!/usr/bin/env node

'use strict';

var fs = require('fs');
var rnpm = require('rnpm/src/config');

// The current working directory should be project root of the app that is linking Realm.
var config = rnpm.getProjectConfig();

if (config.android) {
  var projectGradle = 'android/app/build.gradle';
  fs.readFile(projectGradle, 'utf8', function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    var text = "\
    // Required for Couchbase Lite Android \n\
    // Workaround for duplicate files during packaging of APK issue \n\
    // see https://groups.google.com/d/msg/adt-dev/bl5Rc4Szpzg/wC8cylTWuIEJ \n\
    packagingOptions { \n\
      exclude 'META-INF/ASL2.0' \n\
      exclude 'META-INF/LICENSE' \n\
      exclude 'META-INF/NOTICE' \n\
    }\n\n";
    if (data.indexOf(text) == -1) {
      var position = data.indexOf("android {") + 10;
      var newData = [data.slice(0, position), text, data.slice(position)].join('');
      fs.writeFile(projectGradle, newData, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}