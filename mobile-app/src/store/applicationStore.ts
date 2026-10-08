import { create } from "zustand";
import { applicationService } from "@/modules/applications/services/applicationService";
import { notificationService } from "@/modules/notifications/services/notificationService";
import { getCustomerDrafts } from "@/shared/hooks/useServiceDraft";
import type {
  Application,
  ApplicationDocument,
  ApplicationFormData,
  ChatMessage,
  ChatSender,
  PaymentStatus,
  ServiceCategoryId,
} from "@/types/domain";

import {
  getActiveCustomerMobile,
  getPersistedApplications,
  savePersistedApplications,
  removeDraftRecord,
} from "./applicationStorage";

import {
  draftToApplication,
  getServiceTimeline,
} from "./applicationDraftMappers";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

import {
  DraftSliceState,
  createDraftSlice,
  initialDraftState,
} from "./applicationDraftSlice";

export * from "./applicationDraftTypes";
export * from "./applicationStorage";
export * from "./applicationDraftMappers";
export * from "./applicationDraftSlice";

export interface ApplicationState extends DraftSliceState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  selectedApplicationId: string | null;

  setSelectedApplicationId: (id: string | null) => void;
  setApplications: (apps: Application[]) => void;
  loadApplications: () => Promise<void>;
  addApplication: (app: Application) => void;
  createApplication: (
    serviceId: string,
    serviceName: string,
    category: ServiceCategoryId,
    formData: ApplicationFormData,
    requiredDocs: (string | ApplicationDocument)[],
    paymentAmount: number,
    initialPaymentStatus?: PaymentStatus,
    skipNotification?: boolean,
    customId?: string,
  ) => string;
  uploadDocument: (appId: string, docName: string, fileUri: string) => void;
  addChatMessage: (appId: string, sender: ChatSender, text: string) => void;
  payApplication: (appId: string) => void;
  deleteApplication: (appId: string) => void;
  resetStore: () => void;
}

const timeStamp = (): string =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  isLoading: false,
  error: null,
  selectedApplicationId: null,

  ...createDraftSlice<ApplicationState>(set),

  resetStore: () =>
    set({
      applications: [],
      selectedApplicationId: null,
      error: null,
      ...initialDraftState,
    }),

  setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),

  setApplications: (apps) => {
    set({ applications: apps });
    savePersistedApplications(getActiveCustomerMobile(), apps);
  },

  loadApplications: async () => {
    set({ isLoading: true, error: null });
    const cleanMobile = getActiveCustomerMobile();
    try {
      const [remoteApps, localApps, customerDrafts] = await Promise.all([
        applicationService.getApplications().catch(() => [] as Application[]),
        getPersistedApplications(cleanMobile),
        getCustomerDrafts(cleanMobile).catch(() => []),
      ]);

      const mergedMap = new Map<string, Application>();
      localApps.forEach((app) => mergedMap.set(app.id, app));
      remoteApps.forEach((app) => mergedMap.set(app.id, app));

      const draftApplications: Application[] = customerDrafts.map((draft) =>
        draftToApplication(draft as Record<string, unknown>, cleanMobile),
      );

      const combinedApps = [...Array.from(mergedMap.values()), ...draftApplications];
      set({ applications: combinedApps, isLoading: false, error: null });
    } catch (err: unknown) {
      const localApps = await getPersistedApplications(cleanMobile);
      const customerDrafts = await getCustomerDrafts(cleanMobile).catch(() => []);
      const draftApplications = customerDrafts.map((draft) =>
        draftToApplication(draft as Record<string, unknown>, cleanMobile),
      );
      const fallbackApps = [...localApps, ...draftApplications];
      const errMsg = err instanceof Error ? err.message : "Failed to load applications. Please try again.";
      set({
        applications: fallbackApps,
        isLoading: false,
        error: fallbackApps.length > 0 ? null : errMsg,
      });
    }
  },

  createApplication: (
    serviceId,
    serviceName,
    category,
    formData,
    requiredDocs,
    paymentAmount,
    initialPaymentStatus,
    skipNotification,
    customId,
  ) => {
    const cleanCustomId: string = customId ? String(customId).trim() : "";
    const rawFormData = formData as Record<string, unknown> | undefined;
    const gstIdVal = rawFormData?.gstId ? String(rawFormData.gstId).trim() : "";
    const createdGstIdVal = rawFormData?.createdGstId ? String(rawFormData.createdGstId).trim() : "";
    const formDataGstId: string = gstIdVal || createdGstIdVal || "";

    const backendId: string =
      (cleanCustomId && !/^GST-2026-\d+/i.test(cleanCustomId) ? cleanCustomId : "") ||
      (formDataGstId && !/^GST-2026-\d+/i.test(formDataGstId) ? formDataGstId : "") ||
      cleanCustomId ||
      "";

    const appId: string =
      backendId ||
      `${category.substring(0, 4).toUpperCase()}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApp: Application = {
      id: appId,
      serviceId,
      serviceName,
      category,
      status: "Submitted",
      progress: 20,
      assignedExecutive: "",
      paymentAmount,
      paymentStatus:
        initialPaymentStatus || (paymentAmount > 0 ? "Pending" : "Paid"),
      createdAt: new Date().toISOString().split("T")[0],
      formData,
      documents: requiredDocs.map((doc) =>
        typeof doc === "string"
          ? { name: doc, status: "Pending" }
          : {
              name: doc.name,
              status: doc.status || "Pending",
              fileUri: doc.fileUri,
            },
      ),
      timeline: getServiceTimeline(serviceId),
      chatHistory: [],
    };

    set((state) => {
      const remainingApps = state.applications.filter(
        (a) => !(a.status === "Draft" && a.serviceId === serviceId) && a.id !== appId,
      );
      const nextApps = [newApp, ...remainingApps];
      savePersistedApplications(getActiveCustomerMobile(), nextApps);
      return { applications: nextApps };
    });

    const cleanMobile = getActiveCustomerMobile();
    if (cleanMobile) {
      removeDraftRecord(cleanMobile, serviceId);
    }

    applicationService.createApplication(newApp).catch((err) => {
      logger.warn("[ApplicationStore] Backend application persistence error", { error: getErrorMessage(err) });
    });

    if (!skipNotification) {
      notificationService.notifyApplicationSubmitted(serviceName, appId);
    }

    return appId;
  },

  addApplication: (newApp) => {
    set((state) => ({
      applications: [
        newApp,
        ...state.applications.filter((a) => a.id !== newApp.id),
      ],
    }));

    applicationService.createApplication(newApp).catch((err) => {
      logger.warn("[ApplicationStore] Backend application persistence error", { error: getErrorMessage(err) });
    });
  },

  uploadDocument: (appId, docName, fileUri) =>
    set((state) => {
      const updatedApplications = state.applications.map((app) => {
        if (app.id !== appId) return app;
        const newDocs = app.documents.map((doc) =>
          doc.name === docName
            ? { ...doc, status: "Uploaded" as const, fileUri }
            : doc,
        );
        const uploadedCount = newDocs.filter(
          (d) => d.status === "Uploaded",
        ).length;
        const totalDocs = newDocs.length;
        const progress = Math.min(
          95,
          Math.round(20 + (uploadedCount / totalDocs) * 50),
        );
        const updated = {
          ...app,
          documents: newDocs,
          progress,
          status:
            uploadedCount === totalDocs
              ? ("Verification" as const)
              : ("Document Collection" as const),
        };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to sync updated document to backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApplications);
      return { applications: updatedApplications };
    }),

  addChatMessage: (appId, sender, text) => {
    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      sender,
      text,
      timestamp: timeStamp(),
    };

    set((state) => {
      const updatedApps = state.applications.map((app) => {
        if (app.id !== appId) return app;
        const updated = {
          ...app,
          chatHistory: [...(app.chatHistory || []), newMessage],
        };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to sync chat message to backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApps);
      return { applications: updatedApps };
    });
  },

  payApplication: (appId) => {
    let paidAmount = 0;
    let paidServiceName = "";

    set((state) => {
      const updatedApps = state.applications.map((app) => {
        if (app.id !== appId) return app;
        paidAmount = app.paymentAmount;
        paidServiceName = app.serviceName;
        const newTimeline = app.timeline.map((step) =>
          step.title === "Verification"
            ? { ...step, status: "completed" as const }
            : step,
        );

        const updated = {
          ...app,
          paymentStatus: "Paid" as const,
          progress: Math.min(100, app.progress + 15),
          timeline: newTimeline,
        };
        applicationService.updateApplication(updated).catch((err) => {
          logger.warn("[ApplicationStore] Failed to update paid application on backend", { error: getErrorMessage(err) });
        });
        return updated;
      });
      savePersistedApplications(getActiveCustomerMobile(), updatedApps);
      return { applications: updatedApps };
    });

    if (paidAmount > 0 || paidServiceName) {
      notificationService.notifyPaymentSuccessful(paidAmount, paidServiceName);
    }
  },

  deleteApplication: (appId) => {
    const cleanMobile = getActiveCustomerMobile();
    if (appId.startsWith("DRAFT-")) {
      const serviceKey = appId.replace("DRAFT-", "").toLowerCase();
      removeDraftRecord(cleanMobile, serviceKey);
    }
    set((state) => {
      const targetApp = state.applications.find((a) => a.id === appId);
      if (targetApp && (targetApp.status === "Draft" || targetApp.id.startsWith("DRAFT-"))) {
        const serviceKey = targetApp.serviceId || appId.replace("DRAFT-", "").toLowerCase();
        removeDraftRecord(cleanMobile, serviceKey);
      }
      const remainingApps = state.applications.filter((a) => a.id !== appId);
      savePersistedApplications(getActiveCustomerMobile(), remainingApps);
      return {
        applications: remainingApps,
        selectedApplicationId:
          state.selectedApplicationId === appId
            ? null
            : state.selectedApplicationId,
      };
    });
  },
}));
