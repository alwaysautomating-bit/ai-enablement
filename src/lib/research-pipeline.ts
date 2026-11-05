export type ResearchInput = {
  question: string;
  audience: string;
  priority: string;
  sourceNames: string[];
};

export type ResearchDraft = {
  executive: string;
  findings: string;
  flaggedClaim: string;
  recommendation: string;
};

export type ReviewDefinition = {
  category: "SOURCE" | "SCOPE" | "AUDIENCE";
  title: string;
  detail: string;
};

export function generateFirstDraft(input: ResearchInput): ResearchDraft {
  const sourceSummary =
    input.sourceNames.length === 1
      ? input.sourceNames[0]
      : `${input.sourceNames.slice(0, -1).join(", ")} and ${input.sourceNames.at(-1)}`;

  return {
    executive: `The evidence selected for "${input.question}" points toward a practical opportunity: operations teams need help assembling decision-ready information without rebuilding context for every task.`,
    findings: `Across ${sourceSummary}, the consistent pattern is demand for recognizable, role-specific workflows. Buyers describe less value in general chat and more value in work that begins with a clear outcome, approved information, and visible source context.`,
    flaggedClaim:
      "Public estimates suggest the segment may grow by 18% annually, but that figure is supported by one public source and should be checked before external use.",
    recommendation: `For ${input.audience}, prioritize "${input.priority.toLowerCase()}." Validate the opportunity through preparation time, evidence coverage, and the number of drafts approved without major factual revision.`,
  };
}

export function improveDraft(input: ResearchInput, firstDraft: ResearchDraft): ResearchDraft {
  return {
    executive: `${firstDraft.executive} The unmet need is not another general assistant; it is a reliable way to prepare recurring operational decisions while preserving human judgment.`,
    findings: `${firstDraft.findings} The strongest evidence comes from internal interview material and current market analysis; public estimates remain supporting context rather than the basis of the recommendation.`,
    flaggedClaim: firstDraft.flaggedClaim,
    recommendation: `${firstDraft.recommendation} Start with a connected research brief for operations leads and keep all external actions outside the first release.`,
  };
}

export function buildReviewItems(): ReviewDefinition[] {
  return [
    {
      category: "SOURCE",
      title: "Check the growth estimate",
      detail:
        "The 18% estimate appears in one public source. Confirm it before relying on the number.",
    },
    {
      category: "SCOPE",
      title: "Confirm the comparison scope",
      detail:
        "The brief focuses on direct operational-workflow products and excludes adjacent general assistants.",
    },
    {
      category: "AUDIENCE",
      title: "Confirm this is ready for the intended audience",
      detail:
        "Read the recommendation and confirm its language and level of detail fit the named audience.",
    },
  ];
}
