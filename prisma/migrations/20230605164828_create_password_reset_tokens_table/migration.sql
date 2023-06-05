-- CreateEnum
CREATE TYPE "password_reset_status" AS ENUM ('PENDING', 'INVALID', 'INVOKED');

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "email" VARCHAR(64) NOT NULL,
    "token" VARCHAR(32) NOT NULL,
    "status" "password_reset_status" NOT NULL DEFAULT 'PENDING',
    "expired" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email","token")
);
