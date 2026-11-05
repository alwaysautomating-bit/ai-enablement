import type { SourceIdentityRef, SourceMessage } from "../types";

// The contract every source connector implements. Fixture adapters and live Gmail /
// Slack adapters are interchangeable: the capture pipeline, the context model, and
// review never call a provider API directly.

export type GrantRecord = {
  id: string;
  provider: string;
  accessMode: string;
  scopes: string;
  accountLabel: string;
  accountIdentity: string;
  config: string;
  status: string;
  organizationId: string;
  userId: string;
};

export type ScopeExplanation = {
  scope: string;
  plainLanguage: string;
};

export type ScopeOption = {
  scopeType: string;
  value: string;
  label: string;
  /** Why an option is shown but unavailable (for example direct messages). */
  unavailableReason: string | null;
};

export type ScopeSelection = {
  scopeType: string;
  value: string;
  label: string;
};

export type CollectWindow = {
  start: Date | null;
  end: Date | null;
};

export interface SourceAdapter {
  readonly provider: string;
  /** Plain-language category shown before the word "connector" is earned. */
  readonly plainName: string;
  describeScopes(): ScopeExplanation[];
  listScopeOptions(grant: GrantRecord): Promise<ScopeOption[]>;
  /**
   * Returns only messages the grant's account can see, within the declared scope
   * and window. Adapters must refuse scopes the account cannot read.
   */
  collect(grant: GrantRecord, scope: ScopeSelection[], window: CollectWindow): Promise<SourceMessage[]>;
  resolveIdentity(grant: GrantRecord, externalId: string): Promise<SourceIdentityRef | null>;
}

export class ScopeRefusedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScopeRefusedError";
  }
}
