import { TurboModuleRegistry } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export const PDF_APP_MISSING_MESSAGE =
  "No app that can open PDF files was found on this device. Install a PDF reader, for example Google Drive or Adobe Acrobat Reader, and try again.";

export const PDF_VIEWER_UNAVAILABLE_NOTICE =
  "In-app PDF preview is not available in this version of the app. You can open the file in another app on your device.";

/**
 * True when this build of the app contains the native WebView module that the in-app PDF viewer
 * needs. APKs built before react-native-webview was added do not, and calling into it there only
 * fails. `TurboModuleRegistry.get` returns null instead of throwing, so this check is always safe.
 */
export function isInAppPdfViewerAvailable(
  getModule: (name: string) => unknown = (name) => TurboModuleRegistry.get(name)
): boolean {
  try {
    return getModule("RNCWebViewModule") != null;
  } catch {
    return false;
  }
}

export type OpenPdfExternallyResult = "opened" | "no-app" | "failed";

/**
 * Hands the PDF to the apps installed on the device through the system chooser. This is an explicit,
 * user-triggered action (a button), not what the View action does. It works in builds that do not
 * contain the in-app viewer because it only uses modules that older APKs already include.
 */
export async function openPdfInAnotherApp(
  fileUri: string,
  title?: string
): Promise<OpenPdfExternallyResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return "no-app";

    let localUri = fileUri;
    if (/^https?:\/\//i.test(fileUri)) {
      const target = `${FileSystem.cacheDirectory}tds-pdf-${Date.now()}.pdf`;
      const result = await FileSystem.downloadAsync(fileUri, target);
      if (result.status && result.status >= 400) return "failed";
      localUri = result.uri;
    }

    await Sharing.shareAsync(localUri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: title ? `Open ${title}` : "Open PDF",
    });
    return "opened";
  } catch {
    return "failed";
  }
}
