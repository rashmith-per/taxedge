import { create } from "zustand";

import type { ChatMessage } from "@/types/domain";

const stamp = (): string =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const OPENING: ChatMessage = {
  id: "support-welcome",
  sender: "staff",
  text: "Hi! You're through to Finsolz support. How can we help you today?",
  timestamp: stamp(),
};

/* Canned routing so the thread behaves sensibly without a backend. */
function replyTo(text: string): string {
  const q = text.toLowerCase();
  if (q.includes("track") || q.includes("status") || q.includes("application"))
    return "You can track every filing under the Applications tab. Share the application ID and I'll pull up its current stage.";
  if (q.includes("document") || q.includes("upload") || q.includes("kyc"))
    return "Open the application and use Upload against any pending document. PAN, Aadhaar and bank proof are the usual ones we ask for.";
  if (q.includes("payment") || q.includes("refund") || q.includes("invoice"))
    return "I can see your dues under the Payments tab. Tell me which invoice looks wrong and I'll check it.";
  if (q.includes("expert") || q.includes("call") || q.includes("talk"))
    return "Sure - an expert will call you on your registered number within 30 minutes. Anything specific they should prepare?";
  return "Thanks for reaching out. A Finsolz executive will pick this up shortly. Meanwhile you can reach us on 1800-TAX-EDGE.";
}

export interface SupportState {
  messages: ChatMessage[];
  /** Returns the trimmed text that was sent, or `null` when nothing was sent. */
  sendMessage: (raw: string) => string | null;
  receiveReply: (userText: string) => void;
  hasConversation: () => boolean;
  clearConversation: () => void;
}

/**
 * General support conversation, kept outside any application.
 * Lives for the life of the app process - add async-storage persistence
 * if it should survive a restart.
 */
export const useSupportStore = create<SupportState>((set, get) => ({
  messages: [OPENING],

  sendMessage: (raw) => {
    const text = String(raw || "").trim();
    if (!text) return null;

    set((state) => ({
      messages: [
        ...state.messages,
        { id: `u-${Date.now()}`, sender: "user", text, timestamp: stamp() },
      ],
    }));

    return text;
  },

  receiveReply: (userText) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `s-${Date.now()}`,
          sender: "staff",
          text: replyTo(userText),
          timestamp: stamp(),
        },
      ],
    })),

  hasConversation: () => get().messages.length > 1,

  clearConversation: () =>
    set({ messages: [{ ...OPENING, timestamp: stamp() }] }),
}));
