# react-native-couchbase-lite-android
Couchbase Lite binding for react-native Android

As the name imply, this moudle is only for Android.

This moudle is based on [Getting Started with React Native Android and Couchbase Lite](http://blog.couchbase.com/2015/november/getting-started-with-react-native-android-and-couchbase-lite) by James Nocentini on Couchbase Blog.

### Installation

```
$ npm install react-native-couchbase-lite-android --save
```

* Add dependency to `android/settings.gradle`
```
...
include ':react-native-couchbase-lite-android'
project(':react-native-couchbase-lite-android').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-couchbase-lite-android/android')
```

* Add `android/app/build.gradle`

  ```
  apply plugin: 'com.android.application'

  android {
      ...
  }

  dependencies {
      compile fileTree(dir: 'libs', include: ['*.jar'])
      compile 'com.android.support:appcompat-v7:23.0.0'
      compile 'com.facebook.react:react-native:0.12.+'

      // Add this line:
      compile project(':react-native-couchbase-lite-android')
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
                  .addPackage(new ReactCBLite())  // <------- here
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
import ReactCBLite from 'react-native-couchbase-lite-android'
ReactCBLite.init()
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
