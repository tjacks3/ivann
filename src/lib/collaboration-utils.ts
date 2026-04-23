/**
 * Determines which party is responsible for the next action.
 */
export function getWaitingParty(
  state: string,
): "brand" | "creator" | null {
  switch (state) {
    case "awaiting_brand_brief":
    case "revision_requested":
      return "brand";
    case "awaiting_creator_confirmation":
    case "in_progress":
      return "creator";
    case "submitted":
      return "brand";
    case "completed":
      return null;
    default:
      return null;
  }
}

/**
 * Returns a human-readable waiting label relative to the current user's role.
 */
export function getWaitingLabel(
  state: string,
  userRole: "brand" | "creator",
): string {
  const waitingOn = getWaitingParty(state);
  if (!waitingOn) return "Completed";
  if (waitingOn === userRole) return "Waiting on you";
  return waitingOn === "brand" ? "Waiting on brand" : "Waiting on creator";
}

/**
 * Checks if a deal originated from the QuickCollab flow.
 */
export function isQuickCollabDeal(deal: {
  collabRequestId?: string | null;
}): boolean {
  return !!deal.collabRequestId;
}
