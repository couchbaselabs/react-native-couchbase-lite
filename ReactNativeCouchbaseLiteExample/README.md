## ReactNativeCouchbaseLiteExample

Example project to get started with the React Native Couchbase Lite module.

### Run on iOS

1. Open `ios/ReactNativeCouchbaseLiteExample.xcodeproj` in Xcode.
2. Run `npm install` and `react-native start`.
3. Run the app on a simulator or device.
4. Start Sync Gateway:

  ```
  $ ~/Downloads/couchbase-sync-gateway/bin/sync-gateway sync-gateway-config.json
  ```

5. From the current directory, run the following command to import documents.

  ```
  $ curl -H 'Content-Type: application/json' -vX POST 'http://localhost:4984/moviesapp/_bulk_docs' -d @MoviesExample.json
```

6. You should now see the list of movies in the iOS app:

	<img src="screenshots/thumbnail-ios.png" width="25%" />