/**
 * Compliance id from the create response: JSON `{ complianceId }`, or the
 * "Compliance ID: …" text the backend returns when it replies with plain text.
 */
export const parseCreatedComplianceId = (res: unknown): string | null => {
  let parsedId = null;
  try {
    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    parsedId = parsed?.complianceId;
  } catch {
    const match = String(res).match(/Compliance ID:\s*([A-Za-z0-9_-]+)/i);
    parsedId = match ? match[1] : null;
  }
  return parsedId;
};
