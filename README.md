# react-native-couchbase-lite

## Disclaimer

_This package is not an official couchbase plugin and is not supported in any way by couchbase.  If you have issues with it please **do not use
the couchbase forums** but raise an issue [here](https://github.com/couchbaselabs/react-native-couchbase-lite/issues) instead.  Although
this package does work as described it may not be fully featured and may not be suitable for your requirements.  This package is just a thin 
layer over the CBL REST API, PRs and suggestions are welcome!_

* [Installation](#installation)
* [Getting Started](#getting-started)
* [Documentation](#documentation)

Couchbase Lite binding for react-native on both iOS and Android. It works by exposing some functionality to the native Couchbase Lite and the remaining actions are peformed via the REST API.

## Installation

1. Create a new React Native project.

	```bash
	react-native init <project-name>
	```

2. Navigate to your project directory and install the plugin.

	```bash
	cd <project-name>
	npm install react-native-couchbase-lite --save
	```

3. Link the native libraries.

	```
	react-native link react-native-couchbase-lite
	```

	#### iOS only

	Download the Couchbase Lite iOS SDK from [here](http://www.couchbase.com/nosql-databases/downloads#) and drag **CouchbaseLite.framework**, **CouchbaseLiteListener.framework**, **CBLRegisterJSViewCompiler.h**, **libCBLJSViewCompiler.a** in the Xcode project.

	![](http://cl.ly/image/3Z1b0n0W0i3w/sdk.png)
	
Make sure these files can be resolved via **Framework Search Paths** in the XCODE projects **Build settings**, either by adding them to one of the mentioned directories or adding a new location in the list.

4. Start React Native.

	```bash
	react-native start
	```

5. Build and run for iOS/Android.

> **Note:** If you wish to install the plugin from source, refer to the [other installation options](https://github.com/couchbaselabs/react-native-couchbase-lite/wiki/Other-Installation-Options) page.

## Getting Started

In your app's entrypoint file, import the plugin and initialize the Couchbase Lite Listener.

```js
import Couchbase from "react-native-couchbase-lite";

Couchbase.initRESTClient(manager => {
	// use manager to perform operations
});
```

The manager is the Couchbase Lite entrypoint to perform different operations.

## Documentation

The full API is derived from the [Couchbase Lite Swagger spec](http://developer.couchbase.com/documentation/mobile/current/references/couchbase-lite/rest-api/index.html).

The API is self documented through the `help()` method. You can print the list of tags for an endpoint.

```javascript
Couchbase.initRESTClient(manager => {
	// use manager to perform operations
	manager.help();    // prints all tags and endpoints
});
```

![](https://cl.ly/0M2L2S2M1j1s/tags.png)

Once you know the kind of operation to perform, you can print all the endpoints available on a particular tag.

```javascript
Couchbase.initRESTClient(manager => {
	// use manager to perform operations
	manager.database.help();    // prints all endpoints for the database tag
});
```

![](https://cl.ly/3d1H281z1c1W/database.png)

End finally drill down on a particular endpoint for the operation you wish to perform.

```javascript
Couchbase.initRESTClient(manager => {
	// use manager to perform operations
	manager.database.put_db.help(); // prints the list of parameters for PUT /{db}
});
```

![](https://cl.ly/070z08081W0X/bulk_docs.png)

As you can see, there are two parameters to provide (**db** and **body**). The same exact parameters are documented on the [/{db}}/_bulk_docs](http://developer.couchbase.com/documentation/mobile/current/references/couchbase-lite/rest-api/index.html#!/database/post_db_bulk_docs) endpoint.
