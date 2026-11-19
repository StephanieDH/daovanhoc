package vn.daocauvan.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Đảo Câu Văn: app chỉ mở trang daovanhoc.vercel.app bên trong máy (dùng Android System WebView),
 * không cần trình duyệt. Nội dung game luôn là bản mới nhất trên mạng.
 */
public class MainActivity extends Activity {

    private static final String HOME = "https://daovanhoc.vercel.app/";

    private static final String OFFLINE =
        "<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>"
      + "<body style='font-family:sans-serif;text-align:center;padding:48px 20px;background:#f7f5fb;color:#221c33'>"
      + "<h2>Chưa có mạng</h2><p>Hãy bật Wi-Fi hoặc dữ liệu di động rồi bấm Thử lại.</p>"
      + "<button style='font-size:18px;padding:10px 26px;border-radius:999px;border:0;background:#5b3fa8;color:#fff' "
      + "onclick=\"location.href='" + HOME + "'\">Thử lại</button></body></html>";

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.parseColor("#5b3fa8"));

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web, false);

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false; // mọi trang đều mở ngay trong app
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadDataWithBaseURL(null, OFFLINE, "text/html", "utf-8", null);
                }
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(HOME);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush(); // giữ trạng thái đăng nhập khi tắt app
    }
}
