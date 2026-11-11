import { useCallback, useEffect, useRef, useState } from "react";
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
      Promise.resolve()
        .then(() => saveDraftRef.current())
        .catch((err) => {
          // A failed save must never trap the user on the screen.
          console.warn("[TDS] Saving draft on back failed:", err);
        })
        .finally(() => {
          savingRef.current = false;
          setExited(true);
          repeat();
        });
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
