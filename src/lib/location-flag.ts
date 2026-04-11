/**
 * Maps common location strings to country flag emojis.
 * Matches on country name or common US state/city patterns.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  "us": "\u{1F1FA}\u{1F1F8}",
  "usa": "\u{1F1FA}\u{1F1F8}",
  "united states": "\u{1F1FA}\u{1F1F8}",
  "uk": "\u{1F1EC}\u{1F1E7}",
  "united kingdom": "\u{1F1EC}\u{1F1E7}",
  "canada": "\u{1F1E8}\u{1F1E6}",
  "australia": "\u{1F1E6}\u{1F1FA}",
  "germany": "\u{1F1E9}\u{1F1EA}",
  "france": "\u{1F1EB}\u{1F1F7}",
  "spain": "\u{1F1EA}\u{1F1F8}",
  "italy": "\u{1F1EE}\u{1F1F9}",
  "japan": "\u{1F1EF}\u{1F1F5}",
  "south korea": "\u{1F1F0}\u{1F1F7}",
  "brazil": "\u{1F1E7}\u{1F1F7}",
  "mexico": "\u{1F1F2}\u{1F1FD}",
  "india": "\u{1F1EE}\u{1F1F3}",
  "china": "\u{1F1E8}\u{1F1F3}",
  "indonesia": "\u{1F1EE}\u{1F1E9}",
  "nigeria": "\u{1F1F3}\u{1F1EC}",
  "ireland": "\u{1F1EE}\u{1F1EA}",
  "netherlands": "\u{1F1F3}\u{1F1F1}",
  "uae": "\u{1F1E6}\u{1F1EA}",
  "united arab emirates": "\u{1F1E6}\u{1F1EA}",
  "portugal": "\u{1F1F5}\u{1F1F9}",
  "sweden": "\u{1F1F8}\u{1F1EA}",
  "norway": "\u{1F1F3}\u{1F1F4}",
  "denmark": "\u{1F1E9}\u{1F1F0}",
  "switzerland": "\u{1F1E8}\u{1F1ED}",
  "singapore": "\u{1F1F8}\u{1F1EC}",
  "thailand": "\u{1F1F9}\u{1F1ED}",
  "philippines": "\u{1F1F5}\u{1F1ED}",
  "colombia": "\u{1F1E8}\u{1F1F4}",
  "argentina": "\u{1F1E6}\u{1F1F7}",
};

// US states → US flag
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function getFlagForLocation(location: string): string {
  const lower = location.toLowerCase().trim();

  // Direct country match
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }

  // Check for US state abbreviation pattern like "City, CA" or "City, NY"
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toUpperCase();
    if (US_STATES.includes(lastPart)) {
      return "\u{1F1FA}\u{1F1F8}";
    }
  }

  return "\u{1F310}"; // globe fallback
}
