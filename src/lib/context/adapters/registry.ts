import { FixtureChatAdapter, FixtureEmailAdapter } from "./fixture";
import type { SourceAdapter } from "./types";

// Live adapters (GMAIL, SLACK) register here when their OAuth grants exist. Nothing
// else in the context model changes when they do.
const adapters: SourceAdapter[] = [new FixtureEmailAdapter(), new FixtureChatAdapter()];

export function adapterFor(provider: string): SourceAdapter {
  const adapter = adapters.find((candidate) => candidate.provider === provider);
  if (!adapter) throw new Error(`No source adapter is registered for ${provider}.`);
  return adapter;
}

export function registeredProviders() {
  return adapters.map((adapter) => adapter.provider);
}
