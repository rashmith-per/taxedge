import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError } from "./apiError";
import { InterceptorManager } from "./interceptors";
import { tokenRefreshManager } from "../authentication/tokenRefreshManager";
import {
  getDefaultBaseUrl,
  SERVER_IP,
  SERVER_PORT,
  STORAGE_KEY_SERVER_URL,
} from "./apiConfig";

export { getDefaultBaseUrl, SERVER_IP, SERVER_PORT, STORAGE_KEY_SERVER_URL } from "./apiConfig";

/**
 * Paths that should NEVER trigger a silent refresh on 401.
 * These are the auth endpoints themselves — retrying them would cause infinite loops.
 */
const NO_REFRESH_PATHS = [
  "/auth/refresh",
  "/auth/revoke",
  "/auth/validate",
  "/otp/generate",
  "/otp/verify",
  "/customer/login",
  "/customer/register",
];

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeoutMs?: number;
}

/**
 * Server Network Configuration
 * Change IP and Port here to point the mobile app to your backend.
 */
export class ApiClient {
  private baseUrl: string;
  private baseUrlLoaded = false;
  public interceptors: InterceptorManager;

  constructor(baseUrl: string = getDefaultBaseUrl()) {
    this.baseUrl = baseUrl || getDefaultBaseUrl();
    this.interceptors = new InterceptorManager();
    this.loadCustomBaseUrl().catch(() => { });
  }

  getBaseUrl(): string {
    if (!this.baseUrl || this.baseUrl.trim() === "") {
      this.baseUrl = getDefaultBaseUrl();
    }
    return this.baseUrl;
  }

  setBaseUrl(url: string): void {
    let clean = url.trim();
    // Automatically correct accidental entry of Expo bundler port (8081) to backend port (8088)
    if (clean.includes(":8081")) {
      clean = clean.replace(":8081", `:${SERVER_PORT}`);
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    if (clean.endsWith("/")) {
      clean = clean.slice(0, -1);
    }
    this.baseUrl = clean;
  }

  async ensureBaseUrlLoaded(): Promise<string> {
    if (this.baseUrlLoaded && this.baseUrl && this.baseUrl.trim() !== "") {
      return this.baseUrl;
    }
    await this.loadCustomBaseUrl();
    if (!this.baseUrl || this.baseUrl.trim() === "") {
      this.baseUrl = getDefaultBaseUrl();
    }
    this.baseUrlLoaded = true;
    return this.baseUrl;
  }

  async loadCustomBaseUrl(): Promise<string> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_SERVER_URL);
      if (saved && saved.trim()) {
        let clean = saved.trim();
        if (clean.includes(":8081")) {
          clean = clean.replace(":8081", `:${SERVER_PORT}`);
          await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, clean);
        }
        this.setBaseUrl(clean);
      }
    } catch { }
    this.baseUrlLoaded = true;
    return this.baseUrl;
  }

  async saveCustomBaseUrl(url: string): Promise<string> {
    this.setBaseUrl(url);
    await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, this.baseUrl);
    return this.baseUrl;
  }

  async resetCustomBaseUrl(): Promise<string> {
    this.baseUrl = getDefaultBaseUrl();
    await AsyncStorage.removeItem(STORAGE_KEY_SERVER_URL);
    return this.baseUrl;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    let base = this.baseUrl;
    if (!base || base.trim() === "") {
      base = getDefaultBaseUrl();
      if (!base || base.trim() === "") {
        throw new Error(
          "API base URL is not configured. Set EXPO_PUBLIC_API_URL or save a server URL in the app.",
        );
      }
      this.baseUrl = base;
    }

    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const fullUrl =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${cleanBase}${cleanPath}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }
    const query = Object.entries(params)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&");
    return fullUrl.includes("?")
      ? `${fullUrl}&${query}`
      : `${fullUrl}?${query}`;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", path, body, options);
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  /**
   * Core HTTP request executor with silent 401 token refresh.
   *
   * Flow on HTTP 401:
   *  1. Check if the path is an auth endpoint (skip refresh to avoid loops).
   *  2. Check if this is already a retry (skip to avoid infinite recursion).
   *  3. Call tokenRefreshManager.attemptRefresh() — which uses a mutex so
   *     concurrent 401s only trigger ONE /auth/refresh call.
   *  4. If refresh succeeds → replay this exact request ONCE with the new token.
   *  5. If refresh fails → throw the original 401 ApiError to the caller.
   *
   * @param _isRetry internal flag — true when this is the automatic retry after
   *                 a successful token refresh. Prevents infinite recursion.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
    _isRetry = false,
  ): Promise<T> {
    try {
      await this.ensureBaseUrlLoaded();
      const initialUrl = this.buildUrl(path, options?.params);
      const initialHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options?.headers || {}),
      };

      if (body instanceof FormData) {
        delete initialHeaders["Content-Type"];
      }

      const interceptedConfig = await this.interceptors.runRequestInterceptors({
        url: initialUrl,
        headers: initialHeaders,
        method,
      });

      if (__DEV__) {
        console.log(
          `🌐 [API] ${interceptedConfig.method} ${interceptedConfig.url}`,
        );
      }

      const controller = new AbortController();
      const timeoutMs = options?.timeoutMs || 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        let fetchBody: any = undefined;
        if (body) {
          fetchBody = body instanceof FormData ? body : JSON.stringify(body);
        }

        response = await fetch(interceptedConfig.url, {
          method: interceptedConfig.method,
          headers: interceptedConfig.headers,
          body: fetchBody,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (__DEV__) {
        console.log(
          `🌐 [API] Response status: ${response.status} for ${interceptedConfig.url}`,
        );
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          const errText = await response.text();
          try {
            errorData = JSON.parse(errText);
          } catch {
            errorData = { message: errText || response.statusText };
          }
        } catch {
          errorData = { message: response.statusText };
        }
        const message =
          errorData.message ||
          errorData.error ||
          response.statusText ||
          "Request failed";
        const apiError = new ApiError(
          message,
          response.status,
          errorData.code || "API_ERROR",
          errorData.errors,
        );

        // ── Silent 401 refresh logic ────────────────────────────────────────
        if (
          response.status === 401 &&
          !_isRetry &&
          !this.isAuthEndpoint(path)
        ) {
          console.log(
            `🔄 [API] 401 received for ${path} — attempting silent token refresh...`
          );

          const refreshed = await tokenRefreshManager.attemptRefresh();

          if (refreshed) {
            console.log(
              `🔄 [API] Token refreshed — retrying original request: ${method} ${path}`
            );
            // Retry ONCE with the new token. The request interceptor in
            // AppBootstrap will pick up the fresh token from tokenManager.
            return this.request<T>(method, path, body, options, true);
          }

          console.warn(
            `🔄 [API] Token refresh failed — propagating 401 for ${path}`
          );
        }

        throw apiError;
      }

      const rawText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(rawText);
      } catch {
        // Plain text response from backend (e.g. "OTP sent successfully")
        responseData = rawText;
      }
      return await this.interceptors.runResponseInterceptors<T>(responseData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      let errMessage = (error as any)?.message || "Request failed";
      if (
        errMessage.includes("canceled") ||
        errMessage.includes("aborted") ||
        errMessage.includes("Network request failed") ||
        errMessage.includes("fetch failed")
      ) {
        errMessage =
          "Unable to connect to server. Please check your internet connection.";
      }
      return this.interceptors.runErrorInterceptors(
        new ApiError(errMessage, 500, "NETWORK_ERROR"),
      );
    }
  }

  /**
   * Returns true if the given path is an auth/public endpoint that should
   * NEVER trigger a silent refresh (to prevent infinite loops).
   */
  private isAuthEndpoint(path: string): boolean {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return NO_REFRESH_PATHS.some((p) => cleanPath.startsWith(p));
  }
}

export const apiClient = new ApiClient();
export default apiClient;
