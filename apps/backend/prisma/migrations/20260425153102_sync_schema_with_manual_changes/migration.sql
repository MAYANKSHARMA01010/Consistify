-- DropIndex
DROP INDEX "DailyTaskStatus_userId_date_idx";

-- DropIndex
DROP INDEX "Task_userId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationBannerDismissed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "DailyTaskStatus_userId_date_isCompleted_idx" ON "DailyTaskStatus"("userId", "date", "isCompleted");

-- CreateIndex
CREATE INDEX "Task_userId_isActive_idx" ON "Task"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Task_userId_startDate_endDate_idx" ON "Task"("userId", "startDate", "endDate");
