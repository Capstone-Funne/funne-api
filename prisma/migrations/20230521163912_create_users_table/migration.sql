-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "password" TEXT NOT NULL,
    "picture" TEXT,
    "gender" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
