var { NativeModules } = require('react-native');
var ReactCBLite = NativeModules.ReactCBLite;

var base64 = require('base-64');

var manager = function (databaseUrl, databaseName) {
  this.authHeader = "Basic " + base64.encode(databaseUrl.split("//")[1].split('@')[0]);
  this.databaseUrl = databaseUrl;
  this.databaseName = databaseName;
};

manager.prototype = {

  /**
   * Construct a new Couchbase object given a database URL and database name
   *
   * @returns {*|promise}
   */
  createDatabase: function() {
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName, null, null);
  },

  /*
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
    return this.makeRequest("PUT", this.databaseUrl + this.databaseName + "/" + designDocumentName, {}, data);
  },

  /*
   * Get a design document and all views associated to insert
   *
   * @param    string designDocumentName
   * @return   promise
   */
  getDesignDocument: function(designDocumentName) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designDocumentName);
  },

  /*
   * Query a particular database view
   *
   * @param    string designDocumentName
   * @param    string viewName
   * @param    object options
   * @return   promise
   */
  queryView: function(designDocumentName, viewName, options) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + designDocumentName + "/_view/" + viewName, options);
  },

  /**
   * Create a new database document
   *
   * @param object jsonDocument
   * @returns {*|promise}
   */
  createDocument: function (jsonDocument) {
    return this.makeRequest("POST", this.databaseUrl + this.databaseName, {}, jsonDocument);
  },

  /**
   * Delete a particular document based on its id and revision
   *
   * @param documentId
   * @param documentRevision
   * @return promise
   */
  deleteDocument: function(documentId, documentRevision) {
    return this.makeRequest("DELETE", this.databaseUrl + this.databaseName + "/" + documentId + "?rev=" + documentRevision);
  },

  /*
   * Get a document from the database
   *
   * @param    string documentId
   * @return   promise
   */
  getDocument: function(documentId) {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/" + documentId);
  },

  /**
   * Get all documents from the database
   *
   * @returns {*|promise}
   */
  getAllDocuments: function() {
    return this.makeRequest("GET", this.databaseUrl + this.databaseName + "/_all_docs?include_docs=true");
  },

  /**
   * Replicate in a single direction whether that be remote from local or local to remote
   *
   * @param source
   * @param target
   * @param continuous
   * @returns {*|promise}
   */
  replicate: function(source, target, continuous) {
    return this.makeRequest("POST", this.databaseUrl + "_replicate", {}, {
      source: source,
      target: target,
      continuous: continuous
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
  makeRequest: function(method, url, params, data) {
    var settings = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.authHeader
      }
    };
    if (params) {
      settings.params = params;
    }
    if (data) {
      settings.body = JSON.stringify(data);
    }
    return fetch(url, settings).then((res) => {
      if (res.status == 401) {
        console.log(res);
      }
      return res.json();
    }).catch((err) => { throw err; });
  }
};

module.exports = {manager, ReactCBLite};