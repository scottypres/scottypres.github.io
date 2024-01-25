import Foundation
import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://bit.ly/ppgweather")!)
    }
}

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebView

        init(_ parent: WebView) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            let script = "document.getElementsByTagName('body')[0].style.zoom = '1'"
            webView.evaluateJavaScript(script)
        }
    }
}
