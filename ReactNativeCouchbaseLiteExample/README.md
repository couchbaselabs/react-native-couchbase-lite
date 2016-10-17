## Getting Started (tested on iOS only)

1. Open ios/ReactNativeCouchbaseLiteExample.xcodeproj for iOS.
2. Run `npm install` to install React Native dependencies.
3. Run `npm install ./../` to install react-native-couchbase-lite from the parent directory.
4. Start Sync Gateway.

    ```bash
    $ ~/Downloads/couchbase-sync-gateway/bin/sync-gateway sync-gateway-config.json
    ```

5. From the current directory, run the following command to import documents.

    ```bash
    curl -H 'Content-Type: application/json' -vX POST 'http://localhost:4984/moviesapp/_bulk_docs' -d @MoviesExample.json
    ```

6. You should now see the list of movies in the iOS app (you may have to reload the a few times using **⌘ + R**).

## Steps to add react-native-couchbase-lite from source (tested on iOS only)

You may prefer to clone this repo and use it in your project instead using what is published on npm. The steps below describe how to do that.

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