package me.fraserxu.rncouchbaselite;

import android.content.Context;

import com.couchbase.lite.Database;
import com.couchbase.lite.Manager;
import com.couchbase.lite.View;
import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.javascript.JavaScriptReplicationFilterCompiler;
import com.couchbase.lite.javascript.JavaScriptViewCompiler;
import com.couchbase.lite.listener.Credentials;
import com.couchbase.lite.listener.LiteListener;
import com.couchbase.lite.util.Log;
import com.couchbase.lite.android.*;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class ReactCBLite extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "ReactCBLite";
    private static final int DEFAULT_LISTEN_PORT = 5984;
    private final String TAG = "ReactCBLite";
    private ReactApplicationContext context;
    private int listenPort;
    private Credentials allowedCredentials;

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

    private void initCBLite(int listenPort, String login, String password, Callback errorCallback) {
        try {
            allowedCredentials = new Credentials(login, password);

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
          errorCallback.invoke();

        } catch (final Exception e) {
            e.printStackTrace();
          errorCallback.invoke(e.getMessage());
        }
    }

    private int startCBLListener(int listenPort, Manager manager, Credentials allowedCredentials) {
        LiteListener listener = new LiteListener(manager, listenPort, allowedCredentials);
        int boundPort = listener.getListenPort();
        Thread thread = new Thread(listener);
        thread.start();
        return boundPort;
    }
}
