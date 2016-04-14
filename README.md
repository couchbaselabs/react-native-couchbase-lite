# react-native-couchbase-lite

Couchbase Lite binding for react-native on both iOS and Android.

### Installation

- For iOS, you may have created your React Native project through Cocoapods or using the `react-native init` command. 
Make sure to follow the correct installation instructions below depending on which method you used.
- For Android, see below on how to add the dependency in Android Studio.

## iOS (react-native init)

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

## iOS (Cocoapods)

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

## Android

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

#### Usage

In your app entry, init and start the Couchbase Lite Listener

```JavaScript
import {manager, ReactCBLite} from 'react-native-couchbase-lite'
// init the Listener with a port and login credentials
ReactCBLite.init(5984, 'admin', 'password', e => {
	console.log('initialized');
});

// instantiate a new database
var database = new manager('http://admin:password@localhost:5984/', 'myapp');
database.createDatabase()
  .then((res) => {
    database.getAllDocuments()
      .then((res) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(res.rows)
        });
      });
```

See the [example project](https://github.com/fraserxu/react-native-couchbase-lite/tree/master/ReactNativeCouchbaseLiteExample) for a more in-depth use case.



## Available commands & examples

The full api is [here](https://github.com/fraserxu/react-native-couchbase-lite/blob/master/index.js)

### createDatabase
Example: Create a local Couchbase Lite database named 'dbname'
```
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
```
this.database.deleteDatabase()
  .then((res) => {
    console.log('deleted database!', res);
  }
```

### createDocument(jsonDocument) {
Example: Create a _person_ document
```
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

### getDocument(documentId, revision)
Example: get the latest document by id (revision is optional and if ommitted the latest revision is returned)
```
this.database.getDocument(documentId)
  .then((personDocument) => {
    let docId = personDocument._id;
    let documentRevision = personDocument._rev;

    console.log("Get document", docId, documentRevision, personDocument);
  });
```

### updateDocument(jsonDocument, documentRevision)
Example: Update a _person_ document, change the _gender_ field
```
personDocument.gender = 'male';

this.database.updateDocument(document, documentRevision)
  then((res) => {
    console.log("Updated document", res);
  });
```

### deleteDocument(documentId, documentRevision)
Example: delete a document revision
```
this.database.deleteDocument(documentId, documentRevision)
  then((res) => {
    console.log("Updated document", res);
  });
```

### modifyDocuments(jsonDocuments)
```
let docs = [docA, docB, docC];

this.database.modifyDocuments(docs)
  then((res) => {
    console.log("Updated documents", res);
  });
```

### getAllDocuments()
Example: just run the \_all\_docs query
```
this.database.getAllDocuments()
  .then((res) => {
    console.log("all-docs", res);
  });
```

### getChanges(options)
Example: request changes since the start of time, and subsequently only get changes since the last request 
```
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
```
let designDoc = {
  person_name_view: {
    "map": function (doc) {
      if(doc.type === 'person') {
        emit(doc.firstname.toLowerCase(), null);
        emit(doc.lastname.toLowerCase(), null);
      }
  }.toString(),

  person_age_view: {
    "map": function (doc) {
      if(doc.type === 'person') {
        emit([doc.gender, doc.age], null);
      }
  }.toString()
}

this.database.createDesignDocument('my_design_doc', designDocument)
  .then((res) => {
    console.log("created design doc", res);
  });
```

### getDesignDocument(name)
Example: this will return the views of the the design document called _my_design_doc_ (created above)
```
this.database.getDesignDocument('my_design_doc')
  then((res) => {
    console.log("retreived a design document", res);
  });
```

### deleteDesignDocument(name, revision)
Example: this will delete revision _1_ of the the design document called _my_design_doc_ (created above)
```
let rev = 1;// must query the db to get this value
this.database.getDesignDocument('my_design_doc', rev)
  then((res) => {
    console.log("deleted design document", res);
  });
```

### queryView(designDocumentName, viewName, queryStringParameters)
Example: find all person documents who have a _firstname_ or _lastname_ field that match any of 'john', 'paul', 'ringo' or 'george'
```
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
```
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
```
this.database.getAllDocumentConflicts()
  .then((res) => {
    console.log('documents in conflict', res);
  }
```

### replicate(source, target, continuous) 
Example: set continuous up bi-directional sync using a session cookie acquired from the sync gateway
```
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
          true
        );

        this.database.replicate(
          {headers: {Cookie: sessionCookie}, url: remoteDbUrl},
          dbName,
          true
        );
      }
      default: {
        console.log("Bad user", res);
      }
    }
  });
```

### makeRequest(method, url, queryStringParameters, data)
Can be used to make any query to the Couchbase lite [rest api](http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/index.html).

#### LICENSE
MIT
