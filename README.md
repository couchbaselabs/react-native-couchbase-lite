# react-native-couchbase-lite

## Disclaimer

_This package is not an official couchbase plugin and is not supported in any way by couchbase.  If you have issues with it please **do not use
the couchbase forums** but raise an issue [here](https://github.com/couchbaselabs/react-native-couchbase-lite/issues) instead.  Although
this package does work as described it may not be fully featured and may not be suitable for your requirements.  This package is just a thin 
layer over the CBL REST API, PRs and suggestions are welcome!_

* [Installation](#using-rnpm)
* [Usage](#usage)
* [Documentation](#documentation)
* [Install manually](#install-manually)

Couchbase Lite binding for react-native on both iOS and Android. It works by exposing some functionality to the native Couchbase Lite and the remaining actions are peformed via the REST API.

## Using rnpm

1. Create a new React Native project:

	```bash
	react-native init UntitledApp
	cd UntitledApp
	```

2. Install the React Native Couchbase Lite module:

	```
	npm install --save react-native-couchbase-lite
	```

3. Link the module using rnpm:

	```
	rnpm link react-native-couchbase-lite
	```

Follow the steps below to finish the installation.

### iOS

4. Download the Couchbase Lite iOS SDK from [here](http://www.couchbase.com/nosql-databases/downloads#) and drag **CouchbaseLite.framework**, **CouchbaseLiteListener.framework**, **CBLRegisterJSViewCompiler.h**, **libCBLJSViewCompiler.a** in the Xcode project.

	![](http://cl.ly/image/3Z1b0n0W0i3w/sdk.png)

### Android

4. Add the following in **android/app/build.gradle** under the `android` section:

```groovy
packagingOptions {
		exclude 'META-INF/ASL2.0'
		exclude 'META-INF/LICENSE'
		exclude 'META-INF/NOTICE'
}
```

5. Start the React Native dev server.

```bash
react-native start
```

6. Build and run the app on Android or iOS.

## Usage

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

#### LICENSE

MIT
