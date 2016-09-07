# react-native-couchbase-lite

* [Using rnpm](#using-rnpm)
* [Install manually](#install-manually)
* [Usage](#usage)
* [Examples](#examples)

Couchbase Lite binding for react-native on both iOS and Android. It works by exposing some functionality to the native Couchcase Lite and the remaining actions are peformed via the REST API.

## Using rnpm

Create a new React Native project:
```
react-native init UntitledApp
cd UntitledApp
```
Install the React Native Couchbase Lite module:
```
npm install --save react-native-couchbase-lite
```
Link the module using rnpm:
```
rnpm link react-native-couchbase-lite
```

Follow the steps below to finish the installation.

### iOS

* Download the Couchbase Lite iOS SDK from [here](http://www.couchbase.com/nosql-databases/downloads#) and drag CouchbaseLite.framework, CouchbaseLiteListener.framework in the Xcode project:

![](http://cl.ly/image/3Z1b0n0W0i3w/sdk.png)

### Android

Add the following in `android/app/build.gradle` under the `android` section:
```
packagingOptions {
		exclude 'META-INF/ASL2.0'
		exclude 'META-INF/LICENSE'
		exclude 'META-INF/NOTICE'
}
```

## Install manually

### iOS (react-native init)

```
$ react-init RNTestProj
$ cd RNTestProj
$ npm install react-native-couchbase-lite --save
```

* Drag the ReactCBLite Xcode project in your React Native Xcode project:

![](http://cl.ly/image/0S133n1O3g3W/static-library.png)

* Add ReactCBLite.a (from Workspace location) to the required Libraries and Frameworks.

![](http://cl.ly/image/2c0Z2u0S0r1G/link.png)

* From the `Link Binary With Libraries` section in the `Build Phases` of the top-level project, add the following frameworks in your Xcode project (Couchbase Lite dependencies):

	- libsqlite3.0.tbd
	- libz.tbd
	- Security.framework
	- CFNetwork.framework
	- SystemConfiguration.framework

* Download the Couchbase Lite iOS SDK from [here](http://www.couchbase.com/nosql-databases/downloads#) and drag CouchbaseLite.framework, CouchbaseLiteListener.framework in the Xcode project:

![](http://cl.ly/image/3Z1b0n0W0i3w/sdk.png)

### iOS (Cocoapods)

* Install both npm modules:

```
$ npm install react-native
$ npm install react-native-couchbase-lite
```

* In the `Podfile`, add dependencies:

```
pod 'React', :path => './node_modules/react-native'
pod 'ReactNativeCouchbaseLite', :path => './node_modules/react-native-couchbase-lite'
```

* Install the Cocoapods dependencies:

```
$ pod install
```

* So far so good! Next, you must install CBLRegisterJSViewCompiler.h and libCBLJSViewCompiler.a. You can download both components from [here](http://www.couchbase.com/nosql-databases/downloads#). Drag CBLRegisterJSViewCompiler.h into the couchbase-lite-ios Pod:

![](http://cl.ly/1L2s28462D2W/Image%202016-01-26%20at%2012.47.12%20pm.png)

* Add the libCBLJSViewCompiler.a static library:

![](http://cl.ly/2G1L392h0b1Z/Image%202016-01-27%20at%2010.30.32%20pm.png)

### Android

* Add the `react-native-couchbase-lite` project to your existing React Native project in `android/settings.gradle`

	```
	...
	include ':react-native-couchbase-lite'
	project(':react-native-couchbase-lite').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-couchbase-lite/android')
	```

* Add the Couchbase Maven repository to `android/build.gradle`

	```
	allprojects {
			repositories {
					mavenLocal()
					jcenter()
	
					// add couchbase url
					maven {
							url "http://files.couchbase.com/maven2/"
					}
			}
	}
	```

* Add `android/app/build.gradle`

	```
	apply plugin: 'com.android.application'
	
	android {
			...
	
			packagingOptions {
					exclude 'META-INF/ASL2.0'
					exclude 'META-INF/LICENSE'
					exclude 'META-INF/NOTICE'
			}
	}
	
	dependencies {
			compile fileTree(dir: 'libs', include: ['*.jar'])
			compile 'com.android.support:appcompat-v7:23.0.0'
			compile 'com.facebook.react:react-native:0.12.+'
	
			// Add this line:
			compile project(':react-native-couchbase-lite')
	}
	```

* Register the module in `getPackages` of `MainActivity.java`

  ```
  @Override
  protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new ReactCBLiteManager()				<----- Register the module
      );
  }
  ```

## Usage

In your app entry, init and start the Couchbase Lite Listener

```js
import {manager, ReactCBLite} from 'react-native-couchbase-lite'

ReactCBLite.init((url) => {
      // instantiate a new database
      var database = new manager(url, 'myapp');
      database.createDatabase()
        .then(() => database.getDocuments())
        .then(res => {
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(res.rows)
          });
        });
    });
```

A username/password pair is automatically generated to protect access to the database endpoint.

Or you can provide your own username/password pair:
```js
ReactCBLite.initWithAuth('admin', 'pass', (url) => {
      // instantiate a new database
      var database = new manager(url, 'myapp');
      //...
    });
```

CouchbaseLite iOS has a custom NSURLProtocol that is accessible even after moving the app to the background. It's also more secure as this internal URL is only accessible inside the application's process.
```js
ReactCBLite.initWithAuth('admin', 'pass', (url) => {
      console.log("couchbase lite started at", url);

      if(Platform.OS === 'ios') {
        url = "http://lite.couchbase./";
        console.log("Using couchbase lite internal url", url);
      }

      var database = new manager(url, 'myapp');
      //...
    });
```

See the [example project](https://github.com/fraserxu/react-native-couchbase-lite/tree/master/ReactNativeCouchbaseLiteExample) for a more in-depth use case.

## Examples

The full api is [here](https://github.com/fraserxu/react-native-couchbase-lite/blob/master/index.js)

### createDatabase
Example: Create a local Couchbase Lite database named 'dbname'
```js
let localDbPort = 5984;
let localDbAppName = 'dbname';
let localDbUserId = 'local_user';
let localDbPassword = 'password';
let localDatabaseUrl = `http://${localDbUserId}:${localDbPassword}@localhost:${localDbPort}`;

this.database = new manager(localDatabaseUrl + "/", localDbAppName);

this.database.createDatabase()
  .then((res) => {
    if(res.status == 412) {
      console.log('database already exists', res);
    } else {
      console.log('created database!', res);
    }
  }
```

### deleteDatabase
```js
this.database.deleteDatabase()
  .then((res) => {
    console.log('deleted database!', res);
  }
```

### createDocument(jsonDocument)
Example: Create a _person_ document
```js
this.database.createDocument({
  type: 'person',
  age: 26,
  gender: 'female',
  firstname: 'Linda',
  lastname: 'McCartney'
}).then((res) => {
  let documentId = res.id;
  console.log("created document!", documentId);
});
```

### getDocument(documentId, options)
Example: get specific revision of a document
```js
var options = {rev: "1234"}

this.database.getDocument(documentId, options)
  .then((personDocument) => {
    let docId = personDocument._id;
    let documentRevision = personDocument._rev;

    console.log("Get document", docId, documentRevision, personDocument);
  });
```

Example: get the latest revision of a document along with it's conflicts
```js
var options = {conflicts: true}

this.database.getDocument(documentId, options)
  .then((personDocument) => {
    let docId = personDocument._id;
    let documentRevision = personDocument._rev;

    console.log("Get document", docId, documentRevision, personDocument);
  });
```

### updateDocument(jsonDocument, documentId, documentRevision)
Example: Update a _person_ document, change the _gender_ field
```js
personDocument.gender = 'male';

this.database.updateDocument(personDocument, documentId, documentRevision)
  then((res) => {
    console.log("Updated document", res);
  });
```

### deleteDocument(documentId, documentRevision)
Example: delete a document revision
```js
this.database.deleteDocument(documentId, documentRevision)
  then((res) => {
    console.log("Updated document", res);
  });
```

### modifyDocuments(jsonDocuments)
```js
let docs = [docA, docB, docC];

this.database.modifyDocuments(docs)
  then((res) => {
    console.log("Updated documents", res);
  });
```

### getDocuments()
Example: runs the \_all\_docs query
```js
this.database.getDocuments({include_docs: false})
  .then((res) => {
    console.log("all-docs", res);
  });
```

### getChanges(options)
Example: request changes since the start of time, and subsequently only get changes since the last request 
```js
if(this.since) {
  let options = {
    since: this.since
  };
}

let self = this;

this.database.getChanges(options)
  .then((res) => {
    self.since = res.last_seq;

    res.results.forEach((row) => {
      console.log(row);
    });
}
```

### createDesignDocument(name, views)
Example: create a design document called _my_design_doc_ containing 2 views, one that indexes _person_ documents by *firstname* and *lastname* and the other by *age* coupled with *gender*
```js
let designDoc = {
  "views": {
    person_name_view: {
      "map": function (doc) {
        if(doc.type === 'person') {
          emit(doc.firstname.toLowerCase(), null);
          emit(doc.lastname.toLowerCase(), null);
        }
      }.toString()
    },

    person_age_view: {
      "map": function (doc) {
        if(doc.type === 'person') {
          emit([doc.gender, doc.age], null);
        }
      }.toString(),
    }
  }
}

this.database.createDesignDocument('my_design_doc', designDocument)
  .then((res) => {
    console.log("created design doc", res);
  });
```

### getDesignDocument(name)
Example: this will return the views of the the design document called _my_design_doc_ (created above)
```js
this.database.getDesignDocument('my_design_doc')
  then((res) => {
    console.log("retreived a design document", res);
  });
```

### deleteDesignDocument(name, revision)
Example: this will delete revision _1_ of the the design document called _my_design_doc_ (created above)
```js
let rev = 1;// must query the db to get this value
this.database.getDesignDocument('my_design_doc', rev)
  then((res) => {
    console.log("deleted design document", res);
  });
```

### queryView(designDocumentName, viewName, queryStringParameters)

queryView is a wrapper for the Couchbase Lite REST interface as such it's parametes are more limited than the native QueryView. A full list of supported parameters can be found here:

http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/design-document/get---db--design--design-doc--view--view-name-/index.html

Example: find all person documents who have a _firstname_ or _lastname_ field that match any of 'john', 'paul', 'ringo' or 'george'
```js
let options = {
    keys: ['john', 'paul', 'ringo', 'george']
};

this.database.queryView('my_design_doc', 'person_name_view', options)
  then((res) => {
    res.rows.forEach((row) => {
      console.log("docId", row.id);
    });
  });
```
Example: find all person documents that have _gender_ 'male' and _age_ under 25
```js
let options = {
  descending: true,
  startkey: ['male', 25],
  endkey: ['male', {}]
};

this.database.queryView('my_design_doc', 'person_age_view', options)
  then((res) => {
    res.rows.forEach((row) => {
      console.log("docId", row.id);
    });
  });
```

### getAllDocumentConflicts()
```js
this.database.getAllDocumentConflicts()
  .then((res) => {
    console.log('documents in conflict', res);
  }
```

### listen

Register for changes:

```js
db.getInfo()
  .then((res) => {
    db.listen({since: res.update_seq - 1, feed: 'longpoll'});
  });
```

Receiving change notifications:

```js
db.changesEventEmitter.on('changes', function (e) {
  console.log(e);
}.bind(this));
```


### replicate(source, target, options) 
Valid options listed here: http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/server/post-replicate/index.html
Example: set continuous up bi-directional sync using a session cookie acquired from the sync gateway
```js
let userId = 'user1';
let passowrd = 'password1';
let dbName = 'dbname';
let remoteDatabaseUrl = 'http://localhost:4984';
let remoteBucketName = 'sync_gateway_bucket';
let url = `${remoteDatabaseUrl}/${remoteBucketName}/_session`;

let self = this;

let settings = {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name: userId, password: password})
};

return fetch(url, settings)
  .then((res) => {
    switch (res.status) {
      case 200: {
        let sessionCookie = res.headers.map['set-cookie'][0];

        this.database.replicate(
          dbName,
          {headers: {Cookie: sessionCookie}, url: remoteDbUrl},
          {continuous: true}
        );

        this.database.replicate(
          {headers: {Cookie: sessionCookie}, url: remoteDbUrl},
          dbName,
          {continuous: true}
        );
      }
      default: {
        console.log("Bad user", res);
      }
    }
  });
```

### saveAttachment(method, authHeader, sourceUri, targetUri, contentType, callback)
Example: Save a `thumbnail` image from the Internet on the `movie` document given a URI or file path
```js
var sourceUri = 'http://resizing.flixster.com/DeLpPTAwX3O2LszOpeaMHjbzuAw=/53x77/dkpu1ddg7pbsk.cloudfront.net/movie/11/16/47/11164719_ori.jpg';
database.createDocument({"_id": "movie"})
  .then(doc => database.saveAttachment(doc.id, doc.rev, 'thumbnail', sourceUri, 'image/jpg'))
  .then((res) => {
    console.log(res);
  });
```

### getAttachmentUri(documentId, name, documentRevision)
Example: Get URI of attachment named `thumbnail` on the `movie` document
```js
var uri = database.getAttachmentUri('movie', 'thumbnail', '2-c0cdd75b2b6871995a10eb3f8ce904d6');
console.log(uri);
```

### makeRequest(method, url, queryStringParameters, data)
Can be used to make any query to the Couchbase lite [rest api](http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/index.html).

## SwaggerJS (WIP)

SwaggerJS is a library that generates a JavaScript wrapper based on the Swagger Spec ([http://docs.couchbasemobile.com/couchbase-lite](http://docs.couchbasemobile.com/couchbase-lite)). `ReactNativeCouchbaseLiteExample/index.ios.js` uses SwaggerJS for
 example. You can use the SwaggerJS library to perform all operations listed in the Swagger spec.

#### LICENSE
MIT
