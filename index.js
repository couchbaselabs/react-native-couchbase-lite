var {NativeModules} = require('react-native');
var ReactCBLite = NativeModules.ReactCBLite;

var base64 = require('base-64')
  , events = require('events');

var CHANGE_EVENT_TYPE = 'changes';

var manager = function (databaseUrl, databaseName, authHeader) {
  const userPass = databaseUrl.split("//")[1].split('@')[0];
  this.authHeader = authHeader ? authHeader : "Basic " + base64.encode(userPass);
  this.databaseUrl = databaseUrl.replace(userPass + "@", "");
  this.databaseName = databaseName;
  this.changesEventEmitter = new events.EventEmitter();
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
  createDatabase: function () {
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName, null, null);
  },

  compact: function () {
    return this.makeRequest("POST", this.databaseUrl + this.databaseName + "/_compact", null, null);
  },

  /**
   * Delete the database
   *
   * @returns {*|promise}
   */
  deleteDatabase: function () {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName, null, null);
  },

  /**
   * Get the changes feed.
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/database/get-changes/index.html
   *
   * @returns {*|promise}
   */
  getChanges: function (options) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_changes", options);
  },

  /**
   * Get the latest revision
   *
   * @returns {*|promise}
   */
  latestRevision: function () {
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
  getInfo: function () {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName)
  },

  /**
   * Get the active tasks
   *
   * @returns {*|promise}
   */
  activeTasks: function () {
    return this.makeRequest("GET", this.databaseUrl + "_active_tasks")
  },

  /**
   * Permanently removes references to specified deleted documents from the database.
   * See http://developer.couchbase.com/documentation/mobile/current/develop/references/couchbase-lite/rest-api/index.html#operation---db--_purge-post
   *
   * @param    string deleted document id
   * @param    array document revisions as an array
   *
   * @returns {*|promise}
   */
  purge: function (deletedDocumentId, revs) {
    return this.makeRequest("POST", this.databaseUrl + this.databaseName + "/_purge/", null, {deletedDocumentId: revs})
  },

  /**
   * Get the databases
   *
   * See http://developer.couchbase.com/documentation/mobile/1.2/develop/references/couchbase-lite/rest-api/server/get-all-dbs/index.html
   *
   * @returns {*|promise}
   */
  getAllDatabases: function () {
    return this.makeRequest("GET", this.databaseUrl + "_all_dbs")
  },

  /**
   * Create a new design document with views
   *
   * @param    string designDocumentName
   * @param    object designDocumentViews
   * @return   promise
   */
  createDesignDocument: function (designDocumentName, designDocumentBody) {
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/_design/" + designDocumentName, null, designDocumentBody);
  },

  /**
   * Get a design document and all views associated to insert
   *
   * @param    string designDocumentName
   * @return   promise
   */
  getDesignDocument: function (designDocumentName) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_design/" + designDocumentName);
  },

  /**
   * Delete a particular design document based on its id and revision
   *
   * @param designDocumentName
   * @param documentRevision
   * @return promise
   */
  deleteDesignDocument: function (designDocumentName, documentRevision) {
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
   * @param    object parameters
   * @return   promise
   */
  queryView: function (designDocumentName, viewName, options) {
    var url = this.databaseUrl + this.databaseName + "/_design/" + designDocumentName + "/_view/" + viewName;
    var method = "GET";

    var queryStringParameters = this._encodeKeysParameters(options);

    // if the keys parameter is used we need to do a POST, otherwise the max length for a url is likely to be exceeded
    var body = null;
    if(options.hasOwnProperty("keys")) {
      body = {keys: options.keys};
      delete queryStringParameters['keys'];
      method = "POST";
    }

    return this.makeRequest(method, url, queryStringParameters, body);
  },

  /**
   * Create a new database document
   *
   * @param object jsonDocument
   * @param string jsonDocument (optional)
   * @returns {*|promise}
   */
  createDocument: function (jsonDocument, id) {
    if (id) {
      return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + id, null, jsonDocument);
    } else {
      return this.makeRequest("POST", this.databaseUrl + this.databaseName, null, jsonDocument);
    }
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
   * documentId and documentRevision may be omitted if present in jsonDocument
   *
   * @param object jsonDocument
   * @param string documentId
   * @param string documentRevision (required if updating an existing document)
   * @returns {*|promise}
   */
  updateDocument: function (jsonDocument, documentId, documentRevision) {
    var options = {};

    if (documentRevision) {
      options.rev = documentRevision;
    } else if (jsonDocument.hasOwnProperty('_rev')) {
      options.rev = jsonDocument._rev;
      jsonDocument._rev = undefined;
    }

    if (!documentId && jsonDocument.hasOwnProperty('_id')) {
      documentId = jsonDocument._id;
      jsonDocument._id = undefined;
    }

    return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + documentId, options, jsonDocument);
  },

  /**
   * Delete a particular document based on its id and revision
   *
   * @param documentId
   * @param documentRevision
   * @return promise
   */
  deleteDocument: function (documentId, documentRevision) {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId, {rev: documentRevision});
  },

  /**
   * Delete a named attachment of a particular document
   *
   * @param documentId
   * @param attachmentName
   * @param documentRevision
   * @return promise
   */
  deleteAttachment: function (documentId, documentRevision, attachmentName) {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId + "/" + attachmentName, {rev: documentRevision});
  },

  /**
   * Get a document with optional revision from the database
   *
   * @param    string documentId
   * @param    object options
   * @return   promise
   */
  getDocument: function (documentId, options) {
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
  getDocuments: function (options) {
    var method = "GET";
    var queryStringParameters = this._encodeKeysParameters(options);

    // if the keys parameter is used we need to do a POST, otherwise the max length for a url is likely to be exceeded
    var body = null;
    if(options.hasOwnProperty("keys")) {
      body = {keys: options.keys};
      delete queryStringParameters['keys'];
      method = "POST";
    }

    return this.makeRequest(method, this.databaseUrl + this.databaseName + "/_all_docs", queryStringParameters, body);
  },

  /**
   * Get all conflicts
   *
   * @returns {*|promise}
   */
  getAllDocumentConflicts: function () {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs", {only_conflicts: true});
  },

  /**
   * Replicate in a single direction whether that be remote from local or local to remote.
   *
   * @param string source
   * @param string target
   * @param object options
   * @returns {*|promise}
   */
  replicate: function (source, target, options) {
    var replicateUrl = this.databaseUrl + "_replicate";

    var reqOpts = Object.assign({}, {
      source: source,
      target: target,
    }, options);

    return this.makeRequest("POST", replicateUrl, {}, reqOpts);
  },

  /**
   * Cancel a replication task
   *
   * see http://docs.couchdb.org/en/stable/api/server/common.html#post--_replicate
   *
   * @param object task
   * @returns {*|promise}
   */
  cancelReplicate: function (task) {
    var replicateUrl = this.databaseUrl + "_replicate";

    task.cancel = true;

    return this.makeRequest("POST", replicateUrl, {}, task);
  },

  /**
   * Listen for database changes
   */
  listen: function (queryStringParams) {
    var poller = function (databaseUrl, databaseName, params) {
      var request = new XMLHttpRequest();
      var self = this;
      request.onload = (e) => {
        var data = JSON.parse(request.responseText);
        self.changesEventEmitter.emit(CHANGE_EVENT_TYPE, data);
        params.since = data.last_seq;
        poller(databaseUrl, databaseName, params);
      };
      request.open('GET', databaseUrl + databaseName + '/_changes' + this._encodeParams(params));
      request.setRequestHeader('Authorization', this.authHeader);
      request.send();
    }.bind(this);
    poller(this.databaseUrl, this.databaseName, queryStringParams);
  },

  /**
   * Construct a URI for retrieving attachments
   *
   * @param    string documentId
   * @param    string attachmentName
   * @param    string documentRevision (optional)
   *
   * @returns string
   */
  getAttachmentUri: function (documentId, name, documentRevision) {
    var url = encodeURI(this.databaseUrl + this.databaseName + "/" + documentId + "/" + name);

    if (documentRevision) {
      url += "?rev=" + encodeURIComponent(documentRevision);
    }

    return url;
  },

  /**
   * Save an attachment using a uri OR file path as input
   *
   * @param    string documentId
   * @param    string documentRevision
   * @param    string name
   * @param    string path
   * @param    string contentType
   *
   * @returns {*|promise}
   */
  saveAttachment: function (documentId, documentRevision, name, path, contentType) {
    var uploadUrl = encodeURI(this.databaseUrl + this.databaseName + "/" + documentId + "/" + name) + "?rev=" + encodeURIComponent(documentRevision);

    return new Promise((resolve, reject) => {
      ReactCBLite.upload("PUT", this.authHeader, path, uploadUrl, contentType,
        (err, success) => {
          if (err) {
            reject(err);
          } else {
            resolve(success);
          }
        }
      );
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
  makeRequest: function (method, url, queryStringParameters, data) {
    var body;
    if (data) {
      body = JSON.stringify(data);
    }

    var settings = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authHeader
      }
    };

    if (data) {
      settings.body = body;
    }

    return this._makeRequest(settings, url, queryStringParameters, body)
      .then((res) => {
        return res.json()
      });
  },

  _makeRequest: function (settings, url, queryStringParameters) {
    var fullUrl = encodeURI(url) + this._encodeParams(queryStringParameters);

    return fetch(fullUrl, settings).then((res) => {
      if (res.status >= 400) {
        console.warn("Error return from CBL at", settings.method, fullUrl, res);
      }

      return res
    }).catch((err) => {
      throw new Error("http error for " + settings.method + " '" + fullUrl + "', caused by => " + err);
    });
  },

  _encodeParams: function (queryStringParameters) {
    var queryString = "";

    if (queryStringParameters) {
      var parts = [];

      for (var key in queryStringParameters) {
        var value = queryStringParameters[key];
        var part = key + "=" + encodeURIComponent(value);
        parts.push(part);
      }

      if (parts.length > 0) {
        queryString = "?" + parts.join("&");
      }
    }

    return queryString;
  },

  // certain parameters, all regarding keys, need to be passed as strings
  _encodeKeysParameters(options) {
    var queryStringParameters = {};
    for (var key in options) {
      var value = options[key];
      if (key.toLowerCase() === 'key' || key.toLowerCase() === 'keys' || key.toLowerCase() === 'startkey' || key.toLowerCase() === 'endkey') {
        queryStringParameters[key] = JSON.stringify(value);
      } else {
        queryStringParameters[key] = value;
      }
    }
    return queryStringParameters;
  },
};

module.exports = {manager, ReactCBLite};
