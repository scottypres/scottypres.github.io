//
//  PPGWeather.swift
//  
//
//  Created by Scott Presbrey on 1/24/24.
//

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
          return WKWebView()
      }

      func updateUIView(_ webView: WKWebView, context: Context) {
          let request = URLRequest(url: url)
          webView.load(request)
      }
  }
