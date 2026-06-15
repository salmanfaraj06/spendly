-- Indexes for paginated ledger lists and full-range aggregate analytics.
CREATE INDEX "Transaction_userId_cycleId_date_id_idx" ON "Transaction"("userId", "cycleId", "date", "id");
CREATE INDEX "Transaction_userId_cycleId_type_categoryId_idx" ON "Transaction"("userId", "cycleId", "type", "categoryId");
CREATE INDEX "Transaction_userId_accountId_date_id_idx" ON "Transaction"("userId", "accountId", "date", "id");
CREATE INDEX "Transaction_userId_destinationAccountId_date_id_idx" ON "Transaction"("userId", "destinationAccountId", "date", "id");
CREATE INDEX "Transaction_userId_type_date_idx" ON "Transaction"("userId", "type", "date");
