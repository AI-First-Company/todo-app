-- AlterTable
ALTER TABLE "Todo" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Todo" ADD COLUMN "recurrencePattern" TEXT;
ALTER TABLE "Todo" ADD COLUMN "recurrenceEndDate" TEXT;
ALTER TABLE "Todo" ADD COLUMN "parentTodoId" TEXT;
