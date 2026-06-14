-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('MONTHLY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('CONFIRMED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "receiptPath" TEXT;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '🙂',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "accountId" TEXT NOT NULL,
    "destinationAccountId" TEXT,
    "categoryId" TEXT,
    "notes" TEXT,
    "frequency" "Frequency" NOT NULL,
    "dayOfMonth" INTEGER,
    "weekday" INTEGER,
    "anchorDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringOccurrence" (
    "id" TEXT NOT NULL,
    "recurringTransactionId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "OccurrenceStatus" NOT NULL,
    "postedTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "lines" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsightCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransaction_userId_idx" ON "RecurringTransaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringOccurrence_recurringTransactionId_dueDate_key" ON "RecurringOccurrence"("recurringTransactionId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "InsightCache_userId_cycleId_key" ON "InsightCache"("userId", "cycleId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringOccurrence" ADD CONSTRAINT "RecurringOccurrence_recurringTransactionId_fkey" FOREIGN KEY ("recurringTransactionId") REFERENCES "RecurringTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightCache" ADD CONSTRAINT "InsightCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
