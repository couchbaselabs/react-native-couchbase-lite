# react-native-couchbase-lite
Couchbase Lite binding for react-native

Only for Android at the moment.

This moudle is based on [Getting Started with React Native Android and Couchbase Lite](http://blog.couchbase.com/2015/november/getting-started-with-react-native-android-and-couchbase-lite) by James Nocentini on Couchbase Blog.

### Installation

```
$ npm install react-native-couchbase-lite --save
```

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
