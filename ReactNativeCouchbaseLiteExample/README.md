## Getting Started

1. Open **ios/ReactNativeCouchbaseLiteExample.xcodeproj** in Xcode or **android/build.gradle** in Android Studio.
2. Run `npm install` to install React Native dependencies.
3. Run `npm install ./../` to install react-native-couchbase-lite from the parent directory.
4. Build and run. You should see a list of groceries which is a pre-built database.

	<img src="https://cl.ly/2t31350o0s3x/Simulator%20Screen%20Shot%2030%20Nov%202016,%2014.08.20.png" width="25%" />
	<img src="https://cl.ly/163J0w0Z2w3q/sdk_phone_x86MASTER11302016140903.png" width="25%" />

5. Start Sync Gateway.

    ```bash
    $ ~/Downloads/couchbase-sync-gateway/bin/sync_gateway sync-gateway-config.json
    ```

## Steps to add react-native-couchbase-lite from source

You may prefer to clone this repo and use it in your project instead of using what is published on npm. The steps below describe how to do that.

1. Create a new React Native project.

    ```bash
    # Update react-native-cli
    npm install -g react-native-cli
    # Create a new project
    react-native init MyApp
    # Start the RN server
    cd MyApp
    react-native start
    ```

2. Install the react-native-couchbase-mobile module relatively to the root of this repo.

    ```bash
    npm install ./../
    ```

3. Link it with your **MyApp** project.

    ```bash
    rnpm link react-native-couchbase-lite
    ```

4. Follow [those steps in the README](https://github.com/couchbaselabs/react-native-couchbase-lite#ios) to add the remaining dependencies for iOS and Android.