/*
  Warnings:

  - The `mood` column on the `DailySummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DailySummary" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxStreak" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "mood",
ADD COLUMN     "mood" TEXT;

-- DropEnum
DROP TYPE "Mood";
