package me.fraserxu.rncouchbaselite;

import android.net.Uri;
import android.os.AsyncTask;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Manager;
import com.couchbase.lite.View;
import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.javascript.JavaScriptReplicationFilterCompiler;
import com.couchbase.lite.javascript.JavaScriptViewCompiler;
import com.couchbase.lite.listener.Credentials;
import com.couchbase.lite.listener.LiteListener;
import com.couchbase.lite.util.Log;
import com.couchbase.lite.util.ZipUtils;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;
import java.util.Properties;

import Acme.Serve.Serve;

import static me.fraserxu.rncouchbaselite.ReactNativeJson.convertJsonToMap;

public class ReactCBLite extends ReactContextBaseJavaModule {

    static {
        setLogLevel(Log.WARN);
    }

    public static final String REACT_CLASS = "ReactCBLite";
    private static final String TAG = "ReactCBLite";
    private static final int SUGGESTED_PORT = 5984;
    private ReactApplicationContext context;
    private Manager manager;
    private Credentials allowedCredentials;
    private LiteListener listener;

    public ReactCBLite(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void init(Callback callback) {
        Credentials allowedCredentials = new Credentials();
        this.initWithCredentials(allowedCredentials, callback);
    }

    @ReactMethod
    public static void logLevel(String name) {
        switch (name) {
            case "VERBOSE": {
                setLogLevel(Log.VERBOSE);
                break;
            }
            case "DEBUG": {
                setLogLevel(Log.DEBUG);
                break;
            }
            case "INFO": {
                setLogLevel(Log.INFO);
                break;
            }
            case "WARN": {
                setLogLevel(Log.WARN);
                break;
            }
            case "ERROR": {
                setLogLevel(Log.ERROR);
                break;
            }
            case "ASSERT":
                setLogLevel(Log.ASSERT);
        }
    }

    @ReactMethod
    public void initWithAuth(String username, String password, Callback callback) {
        Credentials credentials;
        if (username == null && password == null) {
            credentials = null;
            Log.w(TAG, "No credential specified, your listener is unsecured and you are putting your data at risk");
        } else if (username == null || password == null) {
            callback.invoke(null, "username and password must not be null");
            return;
        } else {
            credentials = new Credentials(username, password);
        }

        this.initWithCredentials(credentials, callback);
    }

    private void initWithCredentials(Credentials credentials, Callback callback) {
        this.allowedCredentials = credentials;

        try {
            View.setCompiler(new JavaScriptViewCompiler());
            Database.setFilterCompiler(new JavaScriptReplicationFilterCompiler());

            AndroidContext context = new AndroidContext(this.context);

            manager = new Manager(context, Manager.DEFAULT_OPTIONS);

            this.startListener();

            String url;
            if (credentials != null) {
                url = String.format(
                        "http://%s:%s@localhost:%d/",
                        credentials.getLogin(),
                        credentials.getPassword(),
                        listener.getListenPort()
                );
            } else {
                url = String.format(
                        "http://localhost:%d/",
                        listener.getListenPort()
                );
            }

            callback.invoke(url, null);

        } catch (final Exception e) {
            Log.e(TAG, "Couchbase init failed", e);
            callback.invoke(null, e.getMessage());
        }
    }

    private static void setLogLevel(int level) {
        Log.i(TAG, "Setting log level to '" + level + "'");

        Manager.enableLogging(Log.TAG, level);
        Manager.enableLogging(Log.TAG_SYNC, level);
        Manager.enableLogging(Log.TAG_QUERY, level);
        Manager.enableLogging(Log.TAG_VIEW, level);
        Manager.enableLogging(Log.TAG_CHANGE_TRACKER, level);
        Manager.enableLogging(Log.TAG_BLOB_STORE, level);
        Manager.enableLogging(Log.TAG_DATABASE, level);
        Manager.enableLogging(Log.TAG_LISTENER, level);
        Manager.enableLogging(Log.TAG_MULTI_STREAM_WRITER, level);
        Manager.enableLogging(Log.TAG_REMOTE_REQUEST, level);
        Manager.enableLogging(Log.TAG_ROUTER, level);
    }

    @ReactMethod
    public void stopListener() {
        Log.i(TAG, "Stopping CBL listener on port " + listener.getListenPort());
        listener.stop();
    }

    @ReactMethod
    public void startListener() {
        if (listener == null) {
            if (allowedCredentials == null) {
                Log.i(TAG, "No credentials, so binding to localhost");
                Properties props = new Properties();
                props.put(Serve.ARG_BINDADDRESS, "localhost");
                listener = new LiteListener(manager, SUGGESTED_PORT, allowedCredentials, props);
            } else {
                listener = new LiteListener(manager, SUGGESTED_PORT, allowedCredentials);
            }

            Log.i(TAG, "Starting CBL listener on port " + listener.getListenPort());
        } else {
            Log.i(TAG, "Restarting CBL listener on port " + listener.getListenPort());
        }

        listener.start();
    }

    @ReactMethod
    public void upload(String method, String authHeader, String sourceUri, String targetUri, String contentType, Callback callback) {
        if (method == null || !method.toUpperCase().equals("PUT")) {
            callback.invoke("Bad parameter method: " + method);
            return;
        }
        if (authHeader == null) {
            callback.invoke("Bad parameter authHeader");
            return;
        }
        if (sourceUri == null) {
            callback.invoke("Bad parameter sourceUri");
            return;
        }
        if (targetUri == null) {
            callback.invoke("Bad parameter targetUri");
            return;
        }
        if (contentType == null) {
            callback.invoke("Bad parameter contentType");
            return;
        }
        if (callback == null) {
            Log.e(TAG, "no callback");
            return;
        }

        SaveAttachmentTask saveAttachmentTask = new SaveAttachmentTask(method, authHeader, sourceUri, targetUri, contentType, callback);
        saveAttachmentTask.execute();
    }

    private class SaveAttachmentTask extends AsyncTask<URL, Integer, UploadResult> {
        private final String method;
        private final String authHeader;
        private final String sourceUri;
        private final String targetUri;
        private final String contentType;
        private final Callback callback;

        private SaveAttachmentTask(String method, String authHeader, String sourceUri, String targetUri, String contentType, Callback callback) {
            this.method = method;
            this.authHeader = authHeader;
            this.sourceUri = sourceUri;
            this.targetUri = targetUri;
            this.contentType = contentType;
            this.callback = callback;
        }

        @Override
        protected UploadResult doInBackground(URL... params) {
            try {
                Log.i(TAG, "Uploading attachment '" + sourceUri + "' to '" + targetUri + "'");

                InputStream input;
                if (sourceUri.startsWith("/") || sourceUri.startsWith("file:/")) {
                    String path = sourceUri.replace("file://", "/")
                            .replace("file:/", "/");
                    File file = new File(path);

                    input = new FileInputStream(file);
                } else if (sourceUri.startsWith("content://")) {
                    input = ReactCBLite.this.context.getContentResolver().openInputStream(Uri.parse(sourceUri));
                } else {
                    URLConnection urlConnection = new URL(sourceUri).openConnection();
                    input = urlConnection.getInputStream();
                }

                try {
                    HttpURLConnection conn = (HttpURLConnection) new URL(targetUri).openConnection();
                    conn.setRequestProperty("Content-Type", contentType);
                    conn.setRequestProperty("Authorization", authHeader);
                    conn.setReadTimeout(100000);
                    conn.setConnectTimeout(100000);
                    conn.setRequestMethod(method);
                    conn.setDoInput(true);
                    conn.setDoOutput(true);

                    OutputStream os = conn.getOutputStream();
                    try {
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = input.read(buffer)) != -1) {
                            os.write(buffer, 0, bytesRead);
                            publishProgress(bytesRead);
                        }
                    } finally {
                        os.close();
                    }

                    int responseCode = conn.getResponseCode();

                    StringBuilder responseText = new StringBuilder();
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    try {
                        String line;
                        while ((line = br.readLine()) != null) {
                            responseText.append(line);
                        }
                    } finally {
                        br.close();
                    }

                    return new UploadResult(responseCode, responseText.toString());
                } finally {
                    input.close();
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to save attachment", e);
                return new UploadResult(-1, "Failed to save attachment " + e.getMessage());
            }
        }

        @Override
        protected void onProgressUpdate(Integer... values) {
            Log.d(TAG, "Uploaded", Arrays.toString(values));
        }

        @Override
        protected void onPostExecute(UploadResult uploadResult) {
            int responseCode = uploadResult.statusCode;
            WritableMap map = Arguments.createMap();
            map.putInt("statusCode", responseCode);

            if (responseCode == 200 || responseCode == 202) {
                try {
                    JSONObject jsonObject = new JSONObject(uploadResult.response);
                    map.putMap("resp", convertJsonToMap(jsonObject));
                    callback.invoke(null, map);
                } catch (JSONException e) {
                    map.putString("error", uploadResult.response);
                    callback.invoke(map, null);
                    Log.e(TAG, "Failed to parse response from clb: " + uploadResult.response, e);
                }
            } else {
                map.putString("error", uploadResult.response);
                callback.invoke(map, null);
            }
        }
    }

    private static class UploadResult {
        public final int statusCode;
        public final String response;

        public UploadResult(int statusCode, String response) {
            this.statusCode = statusCode;
            this.response = response;
        }
    }
    
    // Database

    @ReactMethod
    public void installPrebuiltDatabase(String name) {
        Manager manager = null;
        Database db = null;
        try {
            manager = new Manager(new AndroidContext(this.context), Manager.DEFAULT_OPTIONS);
            db = manager.getExistingDatabase(name);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
        }
        if (db == null) {
            try {
                ZipUtils.unzip(this.context.getAssets().open(name + ".zip"), manager.getContext().getFilesDir());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }

}
