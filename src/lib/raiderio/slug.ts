// Realm slug + name normalization for the Raider.IO API.
// Examples: "Kel'Thuzad" -> "kelthuzad", "Twisting Nether" -> "twisting-nether".

export function realmSlug(realm: string): string {
  return realm
    .trim()
    .toLowerCase()
    .replace(/'/g, "") // strip apostrophes (no separator)
    .replace(/\s+/g, "-") // spaces -> single hyphen
    .replace(/[^a-z0-9-]/g, "") // strip any remaining non [a-z0-9-]
    .replace(/-+/g, "-") // collapse runs of hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

export function normalizeName(name: string): string {
  return name.trim();
}
