/*
  Warnings:

  - The values [PENDING,UNDER_REVIEW,RESOLVED] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [LOW,MEDIUM,HIGH] on the enum `Severity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'RESOLU');
ALTER TABLE "public"."Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "public"."ReportStatus_old";
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Severity_new" AS ENUM ('BAS', 'MOYEN', 'ELEVE');
ALTER TABLE "public"."Report" ALTER COLUMN "severity" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "severity" TYPE "Severity_new" USING ("severity"::text::"Severity_new");
ALTER TYPE "Severity" RENAME TO "Severity_old";
ALTER TYPE "Severity_new" RENAME TO "Severity";
DROP TYPE "public"."Severity_old";
ALTER TABLE "Report" ALTER COLUMN "severity" SET DEFAULT 'BAS';
COMMIT;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE',
ALTER COLUMN "severity" SET DEFAULT 'BAS';
