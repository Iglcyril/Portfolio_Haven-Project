/*
  Warnings:

  - Added the required column `etablissementId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnonymatLevel" AS ENUM ('total', 'partiel', 'pas_anonyme');

-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('harcelement_scolaire', 'violence_physique', 'violence_verbale', 'cyberharcelement', 'discrimination', 'mal_etre', 'autre');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "anonymatLevel" "AnonymatLevel" NOT NULL DEFAULT 'pas_anonyme',
ADD COLUMN     "categorie" "Categorie" NOT NULL DEFAULT 'autre',
ADD COLUMN     "crisisDetected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "etablissementId" TEXT NOT NULL;
