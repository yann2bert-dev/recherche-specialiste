package app.recherche.specialiste;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#EEF3F8"));
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setGeolocationEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setTextZoom(100);
        try { s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW); } catch (Exception ignored) {}
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });
        web.addJavascriptInterface(new Bridge(), "Android");
        web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){try{if(window.goBack)return window.goBack();}catch(e){}return 'no';})();",
            value -> {
                if (value == null || value.contains("no")) {
                    if (web.canGoBack()) web.goBack();
                    else MainActivity.super.onBackPressed();
                }
            });
    }

    public class Bridge {
        @JavascriptInterface
        public void share(String text) {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, text);
            startActivity(Intent.createChooser(i, "Partager"));
        }

        @JavascriptInterface
        public void call(String tel) {
            startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + tel)));
        }

        @JavascriptInterface
        public void maps(String q) {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=" + Uri.encode(q))));
        }

        @JavascriptInterface
        public void mail(String addr) {
            startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:" + addr)));
        }

        @JavascriptInterface
        public void openUrl(String url) {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        }

        @JavascriptInterface
        public void toast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public String httpGet(String url, String headerLine) {
            HttpURLConnection c = null;
            try {
                URL u = new URL(url);
                c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(15000);
                c.setReadTimeout(20000);
                c.setRequestMethod("GET");
                c.setInstanceFollowRedirects(true);
                c.setRequestProperty("Accept", "application/fhir+json,application/json,text/plain,*/*");
                c.setRequestProperty("User-Agent", "RechercheSpecialiste/1.4.0 (Android; BY Innovation)");
                if (headerLine != null && headerLine.contains(":")) {
                    int i = headerLine.indexOf(':');
                    c.setRequestProperty(headerLine.substring(0, i).trim(), headerLine.substring(i + 1).trim());
                }
                int code = c.getResponseCode();
                InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                StringBuilder sb = new StringBuilder();
                if (in != null) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(in, "UTF-8"));
                    char[] buf = new char[4096];
                    int n, total = 0;
                    while ((n = br.read(buf)) != -1 && total < 350000) {
                        sb.append(buf, 0, n);
                        total += n;
                    }
                    br.close();
                }
                JSONObject o = new JSONObject();
                o.put("ok", code >= 200 && code < 400);
                o.put("status", code);
                o.put("body", sb.toString());
                return o.toString();
            } catch (Exception e) {
                try {
                    JSONObject o = new JSONObject();
                    o.put("ok", false);
                    o.put("status", 0);
                    o.put("body", "");
                    o.put("error", e.getMessage() == null ? "erreur réseau" : e.getMessage());
                    return o.toString();
                } catch (Exception ignored) {
                    return "{\"ok\":false,\"status\":0,\"body\":\"\",\"error\":\"erreur\"}";
                }
            } finally {
                if (c != null) c.disconnect();
            }
        }
    }
}
