import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { PDF_VIEWER_BASE_URL, PDF_VIEWER_HTML } from "./pdfViewerHtml";

export interface PdfViewerModalProps {
  visible: boolean;
  /** Local file:// or content:// URI, or an http(s) URL. */
  fileUri?: string;
  title?: string;
  fileName?: string;
  onClose: () => void;
  /** Show a separate Share button in the header. Sharing only ever happens when it is tapped. */
  allowShare?: boolean;
}

/**
 * react-native-webview 14's bundled typings do not resolve against this project's React Native
 * typings (every WebView prop becomes `never`), so the component is given a narrow explicit type.
 */
interface PdfWebViewHandle {
  injectJavaScript: (script: string) => void;
}
const PdfWebView = WebView as unknown as React.ComponentType<
  Record<string, unknown> & { ref?: React.Ref<PdfWebViewHandle> }
>;

type ViewerState = "preparing" | "rendering" | "ready" | "error";

const isRemote = (uri: string) => /^https?:\/\//i.test(uri);

/** Reads the PDF as base64, downloading remote files into the cache first. */
async function readPdfAsBase64(uri: string): Promise<{ base64: string; localUri: string }> {
  let localUri = uri;
  if (isRemote(uri)) {
    const target = `${FileSystem.cacheDirectory}pdf-preview-${Date.now()}.pdf`;
    const result = await FileSystem.downloadAsync(uri, target);
    if (result.status && result.status >= 400) {
      throw new Error(`Download failed (${result.status})`);
    }
    localUri = result.uri;
  }
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { base64, localUri };
}

/**
 * In-app PDF viewer: renders every page of a PDF inside the app (scroll + pinch zoom) and never
 * hands the file to another app. Sharing is a separate, explicit header button.
 */
export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  visible,
  fileUri,
  title,
  fileName,
  onClose,
  allowShare = true,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<PdfWebViewHandle>(null);
  const pdfBase64 = useRef<string | null>(null);
  const webReady = useRef(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [state, setState] = useState<ViewerState>("preparing");
  const [errorMessage, setErrorMessage] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const pushPdfToWebView = useCallback(() => {
    if (!webReady.current || !pdfBase64.current) return;
    setState("rendering");
    webViewRef.current?.injectJavaScript(
      `window.loadPdf && window.loadPdf(${JSON.stringify(pdfBase64.current)}); true;`
    );
  }, []);

  useEffect(() => {
    if (!visible || !fileUri) return undefined;
    let cancelled = false;
    pdfBase64.current = null;
    webReady.current = false;
    setLocalUri(null);
    setPageCount(0);
    setErrorMessage("");
    setState("preparing");

    readPdfAsBase64(fileUri)
      .then(({ base64, localUri: resolved }) => {
        if (cancelled) return;
        pdfBase64.current = base64;
        setLocalUri(resolved);
        pushPdfToWebView();
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage("Could not open the PDF. The file may have been moved or deleted.");
        setState("error");
      });

    return () => {
      cancelled = true;
      pdfBase64.current = null;
    };
  }, [visible, fileUri, pushPdfToWebView]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === "ready") {
          webReady.current = true;
          pushPdfToWebView();
        } else if (msg.type === "loaded") {
          setPageCount(Number(msg.pages) || 0);
          setState("ready");
        } else if (msg.type === "error") {
          setErrorMessage(msg.message || "The PDF could not be displayed.");
          setState("error");
        }
      } catch {
        // Ignore malformed messages.
      }
    },
    [pushPdfToWebView]
  );

  const handleShare = useCallback(async () => {
    if (!localUri) return;
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Share", "Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(localUri, {
        mimeType: "application/pdf",
        dialogTitle: title || fileName,
      });
    } catch {
      Alert.alert("Share", "Could not share the PDF.");
    }
  }, [localUri, title, fileName]);

  const showOverlay = state === "preparing" || state === "rendering";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close PDF preview"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title || fileName || "PDF Document"}
            </Text>
            {pageCount > 0 ? (
              <Text style={styles.subtitle}>
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </Text>
            ) : null}
          </View>
          {allowShare ? (
            <TouchableOpacity
              onPress={handleShare}
              disabled={!localUri}
              style={[styles.iconButton, !localUri && styles.iconDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Share PDF"
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <View style={styles.body}>
          {visible ? (
            <PdfWebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: PDF_VIEWER_HTML, baseUrl: PDF_VIEWER_BASE_URL }}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              setBuiltInZoomControls
              setDisplayZoomControls={false}
              showsVerticalScrollIndicator
              style={styles.webView}
              onError={() => {
                setErrorMessage("The PDF viewer could not be loaded.");
                setState("error");
              }}
            />
          ) : null}

          {showOverlay ? (
            <View style={styles.overlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#083B75" />
              <Text style={styles.overlayText}>Opening PDF…</Text>
            </View>
          ) : null}

          {state === "error" ? (
            <View style={styles.overlay}>
              <Ionicons name="alert-circle-outline" size={44} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity onPress={onClose} style={styles.errorButton} activeOpacity={0.8}>
                <Text style={styles.errorButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E2E8F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "#083B75",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDisabled: { opacity: 0.4 },
  titleWrap: { flex: 1, paddingHorizontal: 8 },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  subtitle: { color: "#BFDBFE", fontSize: 12, marginTop: 1 },
  body: { flex: 1 },
  webView: { flex: 1, backgroundColor: "#E2E8F0" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 32,
  },
  overlayText: { marginTop: 12, fontSize: 14, color: "#475569" },
  errorText: { marginTop: 12, fontSize: 14, color: "#334155", textAlign: "center" },
  errorButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#083B75",
  },
  errorButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

export default PdfViewerModal;
