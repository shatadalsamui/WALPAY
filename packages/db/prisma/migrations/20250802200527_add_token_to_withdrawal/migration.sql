/*
  Warnings:

  - A unique constraint covering the columns `[withdrawal_token]` on the table `Withdrawal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `withdrawal_token` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "withdrawal_token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_withdrawal_token_key" ON "Withdrawal"("withdrawal_token");
