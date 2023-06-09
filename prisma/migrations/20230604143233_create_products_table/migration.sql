-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(64) NOT NULL,
    "picture" TEXT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
