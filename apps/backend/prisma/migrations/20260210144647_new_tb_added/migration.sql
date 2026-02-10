-- AlterTable
ALTER TABLE "DailySummary" ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "TaskAuditLog" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskAuditLog_summaryId_idx" ON "TaskAuditLog"("summaryId");

-- AddForeignKey
ALTER TABLE "TaskAuditLog" ADD CONSTRAINT "TaskAuditLog_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "DailySummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
