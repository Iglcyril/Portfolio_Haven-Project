-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'ARCHIVE';

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "assignedToId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ReportSummary" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "classLevel" TEXT,
    "identity" TEXT,
    "initialFeeling" TEXT,
    "mood" TEXT,
    "adultContact" TEXT,
    "contactTeam" TEXT,
    "witnessContext" TEXT,
    "victimInfo" TEXT,
    "victimIdentity" TEXT,
    "bullyInfo" TEXT,
    "bullyIdentity" TEXT,
    "situationDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentMessage" (
    "id" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportSummary_reportId_key" ON "ReportSummary"("reportId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSummary" ADD CONSTRAINT "ReportSummary_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
