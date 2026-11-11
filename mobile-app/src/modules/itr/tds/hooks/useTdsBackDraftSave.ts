import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { usePreventRemove } from "expo-router";

export interface UseTdsBackDraftSaveOptions {
  /** False while the screen is not ready (still loading) or has nothing worth saving. */
  shouldSave: boolean;
  /**
   * Writes the latest state to the existing draft storage. Must only persist locally: Back must
   * never submit the application. Read state from refs so the newest values are saved.
   */
  saveDraft: () => void | Promise<void>;
  /** Returns true while a submit / continue request is running; Back is ignored until it ends. */
  isBusy?: () => boolean;
}

/**
 * Saves the TDS draft whenever the user navigates Back (header button, Android hardware Back or
 * back gesture), then lets the navigation continue.
 *
 * `usePreventRemove` blocks the removal, `saveDraft` runs once, and `repeat()` replays the original
 * navigation action. A second Back while the save runs is ignored, so only one save is in flight.
 * If the save fails the user is offered Try Again, Stay or Leave Without Saving; data is never dropped
 * silently.
 * Call the returned `disable()` right before navigating away on purpose (for example after a
 * successful submit) so that navigation is not intercepted.
 */
export function useTdsBackDraftSave({ shouldSave, saveDraft, isBusy }: UseTdsBackDraftSaveOptions) {
  const [exited, setExited] = useState(false);
  const savingRef = useRef(false);
  const saveDraftRef = useRef(saveDraft);
  const isBusyRef = useRef(isBusy);
  const disableRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    saveDraftRef.current = saveDraft;
    isBusyRef.current = isBusy;
  });

  const disablePrevention = usePreventRemove(
    shouldSave && !exited,
    useCallback(({ repeat }) => {
      if (savingRef.current) return;
      if (isBusyRef.current?.()) return;
      savingRef.current = true;

      const leave = () => {
        savingRef.current = false;
        setExited(true);
        repeat();
      };

      const attempt = () => {
        Promise.resolve()
          .then(() => saveDraftRef.current())
          .then(leave)
          .catch((err) => {
            // The draft could not be written. Tell the user instead of silently dropping their data.
            console.warn("[TDS] Saving draft on back failed:", err);
            Alert.alert(
              "Could not save your progress",
              "Your changes could not be saved as a draft. You can try again, stay on this screen, or leave and lose the unsaved changes.",
              [
                { text: "Stay", style: "cancel", onPress: () => { savingRef.current = false; } },
                { text: "Try Again", onPress: attempt },
                { text: "Leave Without Saving", style: "destructive", onPress: leave },
              ],
              { cancelable: false }
            );
          });
      };
      attempt();
    }, [])
  );

  useEffect(() => {
    disableRef.current = disablePrevention;
  }, [disablePrevention]);

  const disable = useCallback(() => {
    setExited(true);
    disableRef.current?.();
  }, []);

  return { disable };
}

export default useTdsBackDraftSave;
