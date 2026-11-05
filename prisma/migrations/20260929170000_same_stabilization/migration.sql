-- SAME semantic stabilization: keep the canonical predicate, its label, the extractor's
-- original predicate, and the stabilization record for every candidate. Additive only.

-- AlterTable
ALTER TABLE "Assertion" ADD COLUMN "predicateLabel" TEXT;
ALTER TABLE "Assertion" ADD COLUMN "rawPredicate" TEXT;
ALTER TABLE "Assertion" ADD COLUMN "stabilization" TEXT NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "OperationalFact" ADD COLUMN "predicateLabel" TEXT;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN "predicateLabel" TEXT;
