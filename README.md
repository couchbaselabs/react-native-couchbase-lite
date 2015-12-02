# react-native-couchbase-lite

Couchbase Lite binding for react-native on both iOS and Android.

### Installation

```
$ npm install react-native-couchbase-lite --save
```

## iOS


* XCode CouchbaseLite project dependency set up: Drag the ReactCBLite Xcode project as a dependency project into your React Native Xcode project.

![](http://cl.ly/image/0S133n1O3g3W/static-library.png)

* XCode ReactCBLite library dependency set up: Add ReactCBLite.a (from Workspace location) to the required Libraries and Frameworks.

![](http://cl.ly/image/2c0Z2u0S0r1G/link.png)

* From the `Link Binary With Libraries` section in the `Build Phases` of the top-level project, add the following frameworks in your Xcode project (they are dependencies for Couchbase Lite)

	- libsqlite3.0.tbd
	- libz.tbd
	- Security.framework
	- CFNetwork.framework
	- SystemConfiguration.framework

* Download the Couchbase Lite iOS SDK from [here](http://www.couchbase.com/nosql-databases/downloads#) and drag CouchbaseLite.framework, CouchbaseLiteListener.framework, CBLRegisterJSViewCompiler.h and libCBLJSViewCompiler.a in the Xcode project.

![](http://cl.ly/image/3Z1b0n0W0i3w/sdk.png)

## Android

* Add dependency to `android/settings.gradle`

```
...
include ':react-native-couchbase-lite'
project(':react-native-couchbase-lite').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-couchbase-lite/android')
```

* Add `android/build.gradle`

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

* Register module in `MainActivity.java`

  ```
  import me.fraserxu.rncouchbaselite.*;  // <--- import

  @Override
      protected void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);
          mReactRootView = new ReactRootView(this);

          mReactInstanceManager = ReactInstanceManager.builder()
                  .setApplication(getApplication())
                  .setBundleAssetName("index.android.bundle")
                  .setJSMainModuleName("index.android")
                  .addPackage(new ReactCBLiteManager())  // <------- here
                  .addPackage(new MainReactPackage())
                  .setUseDeveloperSupport(BuildConfig.DEBUG)
                  .setInitialLifecycleState(LifecycleState.RESUMED)
                  .build();

          mReactRootView.startReactApplication(mReactInstanceManager, "MyApp", null);

          setContentView(mReactRootView);
      }
  ```

#### Usage

In your app entry, init and start listening Couchbase Lite server

```JavaScript
import ReactCBLite from 'react-native-couchbase-lite'
// init the database with a port and login credentials
ReactCBLite.init(5984, 'admin', 'password')
```

Once you started the local Couchbase Lite server, you could simple use the `fetch` method providered by react-native to do your operation.

```JavaScript
const LOCAL_DB_URL = 'http://localhost:5984'

// fetch data
fetch(LOCAL_DB_URL + '/todos/_all_docs?include_docs=true').then((response) => {
  if (response.status !== 200) {
    return fetch(LOCAL_DB_URL + '/todos', {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ok: true})
    }).then((res) => res.json())
  }
  return response.json()
})

// save data
fetch(LOCAL_DB_URL + '/todos', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'list',
    title: 'my title'
  })
}).then((res) => res.json())
```

#### LICENSE
MIT
