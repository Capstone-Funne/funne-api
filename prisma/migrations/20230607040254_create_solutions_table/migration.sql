-- CreateTable
CREATE TABLE "solutions" (
    "id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);
