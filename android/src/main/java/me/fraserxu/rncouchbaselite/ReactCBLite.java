package me.fraserxu.rncouchbaselite;

import android.net.Uri;
import android.os.AsyncTask;

import com.couchbase.lite.Database;
import com.couchbase.lite.Manager;
import com.couchbase.lite.View;
import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.javascript.JavaScriptReplicationFilterCompiler;
import com.couchbase.lite.javascript.JavaScriptViewCompiler;
import com.couchbase.lite.listener.Credentials;
import com.couchbase.lite.listener.LiteListener;
import com.couchbase.lite.util.Log;
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
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;
import java.util.UUID;

import static me.fraserxu.rncouchbaselite.ReactNativeJson.convertJsonToMap;

public class ReactCBLite extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "ReactCBLite";
    private static final String TAG = "ReactCBLite";
    private ReactApplicationContext context;

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
    public void initWithAuth(String username, String password, Callback callback) {
        Credentials allowedCredentials = new Credentials(username, password);
        this.initWithCredentials(allowedCredentials, callback);
    }

    private void initWithCredentials(Credentials allowedCredentials, Callback callback) {
        try {
            int suggestedPort = 5984;

            View.setCompiler(new JavaScriptViewCompiler());
            Database.setFilterCompiler(new JavaScriptReplicationFilterCompiler());

            AndroidContext context = new AndroidContext(this.context);
            Manager.enableLogging(Log.TAG, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_SYNC, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_QUERY, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_VIEW, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_CHANGE_TRACKER, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_BLOB_STORE, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_DATABASE, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_LISTENER, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_MULTI_STREAM_WRITER, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_REMOTE_REQUEST, Log.VERBOSE);
            Manager.enableLogging(Log.TAG_ROUTER, Log.VERBOSE);
            Manager manager = new Manager(context, Manager.DEFAULT_OPTIONS);

            int actualPort = startCBLListener(suggestedPort, manager, allowedCredentials);

            String url = String.format(
                    "http://%s:%s@localhost:%d/",
                    allowedCredentials.getLogin(),
                    allowedCredentials.getPassword(),
                    actualPort
            );

            Log.i(TAG, "CBLite init completed successfully with: " + url);

            callback.invoke(url, null);

        } catch (final Exception e) {
            Log.e(TAG, "Couchbase init failed", e);
            callback.invoke(null, e.getMessage());
        }
    }

    /**
     * no-op only here so the interface mirrors the IOS implementation which needs this method
     */
    @ReactMethod
    public void stopListener() {
    }

    /**
     * no-op only here so the interface mirrors the IOS implementation which needs this method
     */
    @ReactMethod
    public void startListener() {
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

    private int startCBLListener(int listenPort, Manager manager, Credentials allowedCredentials) {
        LiteListener listener = new LiteListener(manager, listenPort, allowedCredentials);
        int boundPort = listener.getListenPort();
        Thread thread = new Thread(listener);
        thread.start();
        return boundPort;
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
                if (sourceUri.startsWith("/")) {
                    input = new FileInputStream(new File(sourceUri));
                } else if (sourceUri.startsWith("content://")){
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
}
