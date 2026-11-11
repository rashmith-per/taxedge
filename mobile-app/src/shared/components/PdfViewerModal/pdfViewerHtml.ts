/**
 * HTML page rendered inside the WebView of PdfViewerModal. It draws every page of a PDF with PDF.js
 * onto stacked canvases (scrollable, pinch-zoomable) and talks to React Native through
 * window.ReactNativeWebView.postMessage.
 *
 * Messages sent to React Native: { type: "ready" } once PDF.js has loaded,
 * { type: "loaded", pages } after the first page is drawn and { type: "error", message }.
 * React Native calls window.loadPdf(base64) after "ready".
 */
const PDFJS_VERSION = "3.11.174";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

export const PDF_VIEWER_BASE_URL = "https://cdnjs.cloudflare.com";

export const PDF_VIEWER_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes" />
<style>
  html, body { margin: 0; padding: 0; background: #E2E8F0; }
  #pages { padding: 8px 0; }
  canvas { display: block; width: 100%; height: auto; margin: 0 auto 8px; background: #fff; box-shadow: 0 1px 4px rgba(15,23,42,.25); }
</style>
</head>
<body>
<div id="pages"></div>
<script src="${PDFJS_BASE}/pdf.min.js"></script>
<script>
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  function fail(e) {
    post({ type: "error", message: String((e && e.message) || e || "Unknown error") });
  }
  window.onerror = function (m) { fail(m); };

  if (!window.pdfjsLib) {
    fail("The PDF engine could not be loaded. Check your internet connection.");
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "${PDFJS_BASE}/pdf.worker.min.js";
    window.loadPdf = async function (base64) {
      try {
        var raw = atob(base64);
        var bytes = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        var pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        var container = document.getElementById("pages");
        container.innerHTML = "";
        var width = document.documentElement.clientWidth || window.innerWidth;
        var ratio = Math.min(window.devicePixelRatio || 1, 2.5);
        for (var n = 1; n <= pdf.numPages; n++) {
          var page = await pdf.getPage(n);
          var base = page.getViewport({ scale: 1 });
          var viewport = page.getViewport({ scale: (width / base.width) * ratio });
          var canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          container.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise;
          if (n === 1) post({ type: "loaded", pages: pdf.numPages });
        }
      } catch (e) { fail(e); }
    };
    post({ type: "ready" });
  }
</script>
</body>
</html>`;
