-- CreateTable
CREATE TABLE "SourceGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accessMode" TEXT NOT NULL DEFAULT 'READ',
    "scopes" TEXT NOT NULL,
    "accountLabel" TEXT NOT NULL,
    "accountIdentity" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SourceGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SourceGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectorCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "expiresAt" DATETIME,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "grantId" TEXT NOT NULL,
    CONSTRAINT "ConnectorCredential_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "SourceGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "windowStart" DATETIME,
    "windowEnd" DATETIME,
    "extractorVersion" TEXT,
    "extractorModel" TEXT,
    "stats" TEXT NOT NULL DEFAULT '{}',
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Capture_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Capture_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureScope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scopeType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    CONSTRAINT "CaptureScope_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaptureScope_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "SourceGrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "threadKey" TEXT NOT NULL,
    "container" TEXT NOT NULL,
    "authorIdentityKey" TEXT NOT NULL,
    "authorDisplay" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "subject" TEXT,
    "communicatedAt" DATETIME NOT NULL,
    "retrievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permalink" TEXT,
    "excerpt" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "envelope" TEXT NOT NULL,
    "sourceAcl" TEXT NOT NULL,
    "retainUntil" DATETIME,
    "organizationId" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    CONSTRAINT "Evidence_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "SourceGrant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "captureId" TEXT NOT NULL,
    CONSTRAINT "Conversation_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureEvidence" (
    "captureId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "conversationId" TEXT,
    "duplicateOfEvidenceId" TEXT,
    "referencesEvidenceIds" TEXT NOT NULL DEFAULT '[]',
    "cited" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("captureId", "evidenceId"),
    CONSTRAINT "CaptureEvidence_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaptureEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaptureEvidence_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SourceIdentity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "entityId" TEXT,
    CONSTRAINT "SourceIdentity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "OpEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpEntity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
    "mergedIntoId" TEXT,
    "envelope" TEXT NOT NULL,
    "createdByCaptureId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "OpEntity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityAlias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alias" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    CONSTRAINT "EntityAlias_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "OpEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assertion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "predicate" TEXT,
    "holderCardinality" TEXT,
    "operationalStatus" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "effectiveFrom" DATETIME,
    "effectiveTo" DATETIME,
    "timeBasis" TEXT NOT NULL,
    "timeExpression" TEXT,
    "firstCommunicatedAt" DATETIME NOT NULL,
    "lastCommunicatedAt" DATETIME NOT NULL,
    "supersedesFactIds" TEXT NOT NULL DEFAULT '[]',
    "rationale" TEXT NOT NULL,
    "extractorVersion" TEXT NOT NULL,
    "extractorModel" TEXT NOT NULL,
    "envelope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,
    "subjectEntityId" TEXT,
    "objectEntityId" TEXT,
    CONSTRAINT "Assertion_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assertion_subjectEntityId_fkey" FOREIGN KEY ("subjectEntityId") REFERENCES "OpEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assertion_objectEntityId_fkey" FOREIGN KEY ("objectEntityId") REFERENCES "OpEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssertionEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "quoteStart" INTEGER NOT NULL,
    "quoteEnd" INTEGER NOT NULL,
    "assertionId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    CONSTRAINT "AssertionEvidence_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "Assertion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssertionEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decision" TEXT NOT NULL,
    "correction" TEXT,
    "visibility" TEXT NOT NULL,
    "note" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assertionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    CONSTRAINT "ReviewDecision_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "Assertion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewDecision_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperationalFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "predicate" TEXT,
    "subjectEntityId" TEXT,
    "objectEntityId" TEXT,
    "effectiveFrom" DATETIME,
    "effectiveTo" DATETIME,
    "timeBasis" TEXT NOT NULL,
    "firstCommunicatedAt" DATETIME NOT NULL,
    "envelope" TEXT NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'OWNER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "supersededById" TEXT,
    "establishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "establishedById" TEXT NOT NULL,
    "assertionId" TEXT NOT NULL,
    CONSTRAINT "OperationalFact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperationalFact_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "Assertion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predicate" TEXT NOT NULL,
    "holderCardinality" TEXT NOT NULL DEFAULT 'MANY',
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "timeBasis" TEXT NOT NULL,
    "firstCommunicatedAt" DATETIME NOT NULL,
    "closedByRelationshipId" TEXT,
    "corroboratingFactIds" TEXT NOT NULL DEFAULT '[]',
    "basis" TEXT NOT NULL DEFAULT 'REVIEWED_ASSERTION',
    "envelope" TEXT NOT NULL,
    "sharing" TEXT NOT NULL DEFAULT 'OWNER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "factId" TEXT NOT NULL,
    CONSTRAINT "Relationship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relationship_fromEntityId_fkey" FOREIGN KEY ("fromEntityId") REFERENCES "OpEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relationship_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "OpEntity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relationship_factId_fkey" FOREIGN KEY ("factId") REFERENCES "OperationalFact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientAccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ClientAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SourceGrant_organizationId_userId_idx" ON "SourceGrant"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectorCredential_grantId_key" ON "ConnectorCredential"("grantId");

-- CreateIndex
CREATE INDEX "Capture_organizationId_createdById_createdAt_idx" ON "Capture"("organizationId", "createdById", "createdAt");

-- CreateIndex
CREATE INDEX "CaptureScope_captureId_idx" ON "CaptureScope"("captureId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_communicatedAt_idx" ON "Evidence"("organizationId", "communicatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_grantId_externalId_key" ON "Evidence"("grantId", "externalId");

-- CreateIndex
CREATE INDEX "Conversation_captureId_idx" ON "Conversation"("captureId");

-- CreateIndex
CREATE INDEX "SourceIdentity_organizationId_identityKey_idx" ON "SourceIdentity"("organizationId", "identityKey");

-- CreateIndex
CREATE UNIQUE INDEX "SourceIdentity_organizationId_provider_externalId_key" ON "SourceIdentity"("organizationId", "provider", "externalId");

-- CreateIndex
CREATE INDEX "OpEntity_organizationId_entityType_idx" ON "OpEntity"("organizationId", "entityType");

-- CreateIndex
CREATE INDEX "EntityAlias_normalized_idx" ON "EntityAlias"("normalized");

-- CreateIndex
CREATE UNIQUE INDEX "EntityAlias_entityId_normalized_key" ON "EntityAlias"("entityId", "normalized");

-- CreateIndex
CREATE INDEX "Assertion_captureId_status_idx" ON "Assertion"("captureId", "status");

-- CreateIndex
CREATE INDEX "Assertion_organizationId_status_idx" ON "Assertion"("organizationId", "status");

-- CreateIndex
CREATE INDEX "AssertionEvidence_assertionId_idx" ON "AssertionEvidence"("assertionId");

-- CreateIndex
CREATE INDEX "AssertionEvidence_evidenceId_idx" ON "AssertionEvidence"("evidenceId");

-- CreateIndex
CREATE INDEX "ReviewDecision_assertionId_idx" ON "ReviewDecision"("assertionId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalFact_assertionId_key" ON "OperationalFact"("assertionId");

-- CreateIndex
CREATE INDEX "OperationalFact_organizationId_status_idx" ON "OperationalFact"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Relationship_organizationId_toEntityId_predicate_idx" ON "Relationship"("organizationId", "toEntityId", "predicate");

-- CreateIndex
CREATE INDEX "Relationship_organizationId_fromEntityId_idx" ON "Relationship"("organizationId", "fromEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccessToken_tokenHash_key" ON "ClientAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientAccessToken_userId_idx" ON "ClientAccessToken"("userId");

