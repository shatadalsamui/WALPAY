-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "bankReferenceId" TEXT,
ALTER COLUMN "withdrawal_token" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Withdrawal_bankReferenceId_idx" ON "Withdrawal"("bankReferenceId");
