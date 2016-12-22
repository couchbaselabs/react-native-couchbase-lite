# 0.7.0 (December 22, 2016)

**Warning:** Version 0.7.0 of this plugin breaks all previous versions. To migrate your existing app over, you will need to re-write all existing references in your project. Refer to the README for tips on quickly navigating through the new API.

## REST API Client

- Refactored the JavaScript bridging module to expose one object (`Couchbase`).
- Added the Couchbase Lite Swagger spec ([6fbd119](https://github.com/couchbaselabs/couchbase-mobile-portal/tree/6fbd119fb955b1ecd99073011747d659074b66f6)) and made it available through [SwaggerJS](https://github.com/swagger-api/swagger-js).

## Native API Methods

- Added `installPrebuiltDatabase(databaseName)`.