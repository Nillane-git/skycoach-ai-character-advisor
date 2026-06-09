// Realm slug + name normalization for the Raider.IO API.
// Examples: "Kel'Thuzad" -> "kelthuzad", "Twisting Nether" -> "twisting-nether".

export function realmSlug(realm: string): string {
  return realm
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "") // strip apostrophes (ASCII + curly), no separator
    .replace(/\s+/g, "-") // spaces -> single hyphen
    // Keep letters (incl. non-Latin like Cyrillic for RU realms) & digits;
    // drop only punctuation/symbols. Stripping non-ASCII here used to blank
    // out RU realms entirely ("Гордунни" -> "") and silently swallow submit.
    .replace(/[^\p{Letter}\p{Number}-]/gu, "")
    .replace(/-+/g, "-") // collapse runs of hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

export function normalizeName(name: string): string {
  return name.trim();
}
