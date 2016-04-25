package me.fraserxu.rncouchbaselite;

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
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;

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
    public void init(int listenPort, String login, String password, Callback errorCallback) {
        initCBLite(listenPort, login, password, errorCallback);
    }

    @ReactMethod
    public void upload(String method, String authHeader, String sourceUri, String targetUri, String contentType, Callback successCallback, Callback errorCallback) {
        SaveAttachmentTask saveAttachmentTask = new SaveAttachmentTask(method, authHeader, sourceUri, targetUri, contentType, successCallback, errorCallback);
        saveAttachmentTask.execute();
    }

    private void initCBLite(int listenPort, String login, String password, Callback callback) {
        try {
            Credentials allowedCredentials = new Credentials(login, password);

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

            listenPort = startCBLListener(listenPort, manager, allowedCredentials);

            Log.i(TAG, "initCBLite() completed successfully with: " + String.format(
                    "http://%s:%s@localhost:%d/",
                    allowedCredentials.getLogin(),
                    allowedCredentials.getPassword(),
                    listenPort));

            callback.invoke();

        } catch (final Exception e) {
            Log.e(TAG, "Couchbase init failed", e);
            callback.invoke(e.getMessage());
        }
    }

    private int startCBLListener(int listenPort, Manager manager, Credentials allowedCredentials) {
        LiteListener listener = new LiteListener(manager, listenPort, allowedCredentials);
        int boundPort = listener.getListenPort();
        Thread thread = new Thread(listener);
        thread.start();
        return boundPort;
    }

    private static class SaveAttachmentTask extends AsyncTask<URL, Integer, UploadResult> {
        private final String method;
        private final String authHeader;
        private final String sourceUri;
        private final String targetUri;
        private final String contentType;
        private final Callback successCallback;
        private final Callback errorCallback;

        private SaveAttachmentTask(String method, String authHeader, String sourceUri, String targetUri, String contentType, Callback successCallback, Callback errorCallback) {
            this.method = method;
            this.authHeader = authHeader;
            this.sourceUri = sourceUri;
            this.targetUri = targetUri;
            this.contentType = contentType;
            this.successCallback = successCallback;
            this.errorCallback = errorCallback;
        }

        @Override
        protected UploadResult doInBackground(URL... params) {
            try {
                InputStream input;
                if (sourceUri.startsWith("/")) {
                    Log.i(TAG, "Uploading file attachment '" + sourceUri + "' to '" + targetUri + "'");
                    input = new FileInputStream(new File(sourceUri));
                } else {
                    Log.i(TAG, "Uploading uri attachment '" + sourceUri + "' to '" + targetUri + "'");
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

            } catch (IOException e) {
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

            if(responseCode == 200 || responseCode == 202)
                successCallback.invoke("Success " + responseCode + " " + uploadResult.response);
            else
                errorCallback.invoke("Failed " + responseCode + " " + uploadResult.response);
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
