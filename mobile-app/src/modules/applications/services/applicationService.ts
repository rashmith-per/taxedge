import { apiClient } from "../../../core/api/apiClient";
import { useAuthStore } from "../../authentication/store/authStore";
import { logger } from "../../../core/logging/logger";
import type { Application } from "../../../types/domain";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const state = useAuthStore.getState();
  const customerId = state.customer?.customerId || state.authenticatedUser?.customerId;
  const mobile = state.customer?.mobile || state.authenticatedUser?.mobileNumber || state.mobileNumber;

  if (customerId && customerId.trim()) {
    headers["X-Customer-Id"] = customerId.trim();
  }
  if (mobile && mobile.trim()) {
    headers["X-Customer-Mobile"] = mobile.trim();
  }
  return headers;
}

export const applicationService = {
  getApplications: async (): Promise<Application[]> => {
    const headers = getAuthHeaders();
    try {
      const result = await apiClient.get<Application[]>("/applications", { headers });
      if (!Array.isArray(result)) return [];
      return result.map((app) => ({
        ...app,
        documents: Array.isArray(app?.documents) ? app.documents : [],
        timeline: Array.isArray(app?.timeline) ? app.timeline : [],
        chatHistory: Array.isArray(app?.chatHistory) ? app.chatHistory : [],
      }));
    } catch {
      return [];
    }
  },

  getApplicationById: async (id: string): Promise<Application | null> => {
    if (!id) return null;
    const headers = getAuthHeaders();
    try {
      return await apiClient.get<Application>("/applications/" + encodeURIComponent(id), { headers });
    } catch {
      return null;
    }
  },

  createApplication: async (app: Application): Promise<Application> => {
    const headers = getAuthHeaders();
    const state = useAuthStore.getState();
    const customerId = state.customer?.customerId || state.authenticatedUser?.customerId;
    const mobile = state.customer?.mobile || state.authenticatedUser?.mobileNumber || state.mobileNumber;

    const payload = {
      ...app,
      id: app.id && app.id.trim() ? app.id.trim() : `APP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customerId || undefined,
      mobileNumber: mobile || undefined,
    };

    return await apiClient.post<Application>("/applications", payload, { headers });
  },

  updateApplication: async (app: Application): Promise<Application> => {
    const headers = getAuthHeaders();
    return await apiClient.post<Application>("/applications", app, { headers });
  },

  sendChatMessage: async (appId: string, text: string, sender: "user" | "staff" = "user"): Promise<boolean> => {
    try {
      const app = await applicationService.getApplicationById(appId);
      if (!app) return false;

      const newMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedApp: Application = {
        ...app,
        chatHistory: [...(app.chatHistory || []), newMessage],
      };

      await applicationService.updateApplication(updatedApp);
      return true;
    } catch (e) {
      logger.warn("[applicationService] Failed to persist chat message to backend:", { error: e });
      return false;
    }
  },
};

export default applicationService;
