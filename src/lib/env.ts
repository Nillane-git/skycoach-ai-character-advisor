export const env = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  DEMO_MODE: process.env.DEMO_MODE === "1",
};

export const hasAnthropicKey = (): boolean =>
  env.ANTHROPIC_API_KEY.trim().length > 0;
