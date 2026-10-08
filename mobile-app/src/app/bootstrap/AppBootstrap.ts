import { moduleRegistry } from "./ModuleRegistry";
import { container } from "./DependencyContainer";
import { apiClient } from "@/core/api/apiClient";
import { tokenManager } from "@/core/authentication/tokenManager";
import { tokenRefreshManager } from "@/core/authentication/tokenRefreshManager";
import { sessionManager } from "@/core/authentication/sessionManager";
import { logger } from "@/core/logging/logger";

export class AppBootstrap {
  private static isInitialized = false;

  static async init(): Promise<void> {
    if (this.isInitialized) return;

    logger.info("Starting TaxEdge App Bootstrap...");

    // Register core dependencies
    container.register("apiClient", apiClient);
    container.register("tokenManager", tokenManager);
    container.register("sessionManager", sessionManager);
    container.register("logger", logger);

    // ── Request interceptor: attach Bearer token ──────────────────────────
    apiClient.interceptors.useRequest(async (config) => {
      const token = await tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // ── Session-expired handler ───────────────────────────────────────────
    // Fired by tokenRefreshManager when the refresh token itself is expired
    // or revoked. The session is irrecoverably dead — clear auth state.
    tokenRefreshManager.onSessionExpired(() => {
      logger.warn(
        "Session expired — refresh token is no longer valid. Clearing auth state."
      );
      sessionManager.logout().catch((err) => {
        logger.warn("[AppBootstrap] Error during automatic session expiration logout:", { error: err });
      });
    });

    // Initialize all domain modules
    await moduleRegistry.initializeAll();

    this.isInitialized = true;
    logger.info("TaxEdge App Bootstrap completed successfully.");
  }
}

export default AppBootstrap;
