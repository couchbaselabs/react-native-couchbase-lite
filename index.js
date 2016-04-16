var { NativeModules } = require('react-native');
var ReactCBLite = NativeModules.ReactCBLite;

var base64 = require('base-64');

var manager = function (databaseUrl, databaseName) {
  this.authHeader = "Basic " + base64.encode(databaseUrl.split("//")[1].split('@')[0]);
  this.databaseUrl = databaseUrl;
  this.databaseName = databaseName;
};

/**
 * Wrapper around the CBL rest API.
 *
 * See: http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/index.html
 */
manager.prototype = {

  /**
   * Construct a new Couchbase object given a database URL and database name
   *
   * @returns {*|promise}
   */
  createDatabase: function() {
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName, null, null);
  },

  /**
   * Delete the database
   *
   * @returns {*|promise}
   */
  deleteDatabase: function() {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName, null, null);
  },

  /**
   * Get the changes feed.
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/get-changes/index.html
   *
   * @returns {*|promise}
   */
  getChanges: function(options) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_changes", options);
  },

  /**
   * Get the latest revision
   *
   * @returns {*|promise}
   */
  latestRevision: function() {
    return this.getInfo()
        .then((res) => {
            return res.update_seq;
        });
  },

  /**
   * Get the meta-information
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/server/get--/index.html
   *
   * @returns {*|promise}
   */
  getInfo: function() {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName)
  },

  /**
   * Get the active tasks
   *
   * @returns {*|promise}
   */
  activeTasks: function() {
    return this.makeRequest("GET", this.databaseUrl + "_active_tasks")
  },

  /**
   * Get the databases
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/server/get-all-dbs/index.html
   *
   * @returns {*|promise}
   */
  getAllDatabases: function() {
    return this.makeRequest("GET", this.databaseUrl + "_all_dbs")
  },

  /**
   * Create a new design document with views
   *
   * @param    string designDocumentName
   * @param    object designDocumentViews
   * @return   promise
   */
  createDesignDocument: function(designDocumentName, designDocumentViews) {
    var data = {
      views: designDocumentViews
    };
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/_design/" + designDocumentName, null, data);
  },

  /**
   * Get a design document and all views associated to insert
   *
   * @param    string designDocumentName
   * @return   promise
   */
  getDesignDocument: function(designDocumentName) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_design/" + designDocumentName);
  },

  /**
   * Delete a particular design document based on its id and revision
   *
   * @param designDocumentName
   * @param documentRevision
   * @return promise
   */
  deleteDesignDocument: function(designDocumentName, documentRevision) {
    var documentId = "_design/" + designDocumentName;
    return this.deleteDocument(documentId, documentRevision);
  },

  /**
   * Query a particular database view. Options for the query ('descending', 'limit', 'startkey', 'endkey' etc.)
   * can be specified using query string parameters.  Query string values are json objects and are URL encoded within,
   * for example:
   *
   *  var options = {
   *    descending: true,
   *    startkey: [docId, {}],
   *    endkey: [docId]
   *  };
   *
   *  return queryView('design_doc_name', 'view_name', options);
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/design-document/get---db--design--design-doc--view--view-name-/index.html
   *
   * @param    string designDocumentName
   * @param    string viewName
   * @param    object queryStringParameters
   * @return   promise
   */
  queryView: function(designDocumentName, viewName, options) {
    var url = this.databaseUrl + this.databaseName + "/_design/" + designDocumentName + "/_view/" + viewName;

    var queryStringParameters = {};
    if(options) {
      for(var key in options) {
        var value = options[key];
        queryStringParameters[key] = JSON.stringify(value);
      }
    }

    return this.makeRequest("GET", url, queryStringParameters);
  },

  /**
   * Create a new database document
   *
   * @param object jsonDocument
   * @returns {*|promise}
   */
  createDocument: function (jsonDocument) {
    return this.makeRequest("POST", this.databaseUrl + this.databaseName, null, jsonDocument);
  },

  /**
   * Add, update, or delete multiple documents to a database in a single request
   *
   * @param object jsonDocuments array
   * @returns {*|promise}
   */
  modifyDocuments: function (jsonDocuments) {
    return this.makeRequest("POST", this.databaseUrl + this.databaseName + '/_bulk_docs', null, {docs: jsonDocuments});
  },

  /**
   * Creates a new document or creates a new revision of an existing document
   *
   * @param object jsonDocument
   * @param string documentRevision (optional)
   * @returns {*|promise}
   */
  updateDocument: function (jsonDocument, documentRevision) {
    var options = {}

    if(documentRevision) {
        options.rev = documentRevision;
    }

    return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + jsonDocument._id, options, jsonDocument);
  },

  /**
   * Delete a particular document based on its id and revision
   *
   * @param documentId
   * @param documentRevision
   * @return promise
   */
  deleteDocument: function(documentId, documentRevision) {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision});
  },

  /**
   * Get a document with optional revision from the database
   *
   * @param    string documentId
   * @param    string revision (optional)
   * @return   promise
   */
  getDocument: function(documentId, rev) {
    var options = {};
    if(rev) {
      options.rev = rev;
    }
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + documentId, options);
  },

  /**
   * Get documents from the database using the _all_docs endpoint
   *
   * see http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/get-all-docs/index.html
   *
   * @param   options
   * @returns {*|promise}
   */
  getDocuments: function(options) {
    var queryStringParameters = {}

    if(options) {
      for(var key in options) {
        var value = options[key];
        queryStringParameters[key] = JSON.stringify(value);
      }
    }

    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs", queryStringParameters);
  },

  /**
   * Get all documents from the database
   *
   * @returns {*|promise}
   */
  getAllDocuments: function() {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs", {include_docs: true});
  },

  /**
   * Get all conflicts
   *
   * @returns {*|promise}
   */
  getAllDocumentConflicts: function() {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs", {only_conflicts: true});
  },

  /**
   * Replicate in a single direction whether that be remote from local or local to remote.
   *
   * @param string source
   * @param string target
   * @param boolean continuous
   * @param boolean createTarget
   * @returns {*|promise}
   */
  replicate: function(source, target, continuous, createTarget) {
    var replicateUrl = this.databaseUrl + "_replicate";

    return this.makeRequest("POST", replicateUrl, {}, {
      source: source,
      target: target,
      continuous: continuous,
      create_target: createTarget
    });
  },

  /**
   * Make a RESTful request to an endpoint while providing parameters or data or both
   *
   * @param string method
   * @param string url
   * @param object params
   * @param object data
   * @returns {*|promise}
   */
  makeRequest: function(method, url, queryStringParameters, data) {
    return this._makeRequest(method, url, queryStringParameters, data)
        .then((res) => {return res.json()});
  },

  _makeRequest: function(method, url, queryStringParameters, data) {
    var settings = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authHeader
      }
    };

    var queryString = "";

    if(queryStringParameters) {
      var parts = [];

      for(var key in queryStringParameters) {
        var value = queryStringParameters[key];
        var part = key + "=" + encodeURIComponent(value);
        parts.push(part);
      }

      if(parts.length > 0) {
          queryString = "?" + parts.join("&");
      }
    }

    var fullUrl = url + queryString;

//    console.log(method, fullUrl);

    if (data) {
      settings.body = JSON.stringify(data);
    }

    return fetch(fullUrl, settings).then((res) => {
      if (res.status == 401) {
        console.warn("cbl request failed", method, fullUrl, JSON.stringify(res));

        throw new Error("Not authorized to " + method + " to '" + fullUrl + "' [" + res.status + "]");
      }
      return res
    }).catch((err) => {
        throw new Error("http error for '" + fullUrl + "', caused by => " + err);
    });
  }
};

module.exports = {manager, ReactCBLite};
