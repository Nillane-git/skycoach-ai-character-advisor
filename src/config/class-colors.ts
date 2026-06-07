// Official WoW class colors, keyed by lowercase class name.
export const CLASS_COLORS: Record<string, string> = {
  "death knight": "#C41E3A",
  "demon hunter": "#A330C9",
  druid: "#FF7C0A",
  evoker: "#33937F",
  hunter: "#AAD372",
  mage: "#3FC7EB",
  monk: "#00FF98",
  paladin: "#F48CBA",
  priest: "#E6E6E6",
  rogue: "#FFF468",
  shaman: "#0070DD",
  warlock: "#8788EE",
  warrior: "#C69B6D",
};

export const DEFAULT_ACCENT = "#7C8CF8";

export function classColor(className: string): string {
  return CLASS_COLORS[className.toLowerCase()] ?? DEFAULT_ACCENT;
}
