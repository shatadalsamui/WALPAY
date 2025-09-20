/*
  Warnings:

  - You are about to drop the column `sessionInvalidatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "sessionInvalidatedAt";
