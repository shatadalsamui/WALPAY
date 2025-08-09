-- AlterTable
ALTER TABLE "public"."PasswordResetOtp" ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false;
