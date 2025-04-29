-- CreateTable
CREATE TABLE "Order" (
    "orderID" TEXT NOT NULL,
    "orderWorth" DOUBLE PRECISION NOT NULL,
    "products" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderID")
);

-- CreateTable
CREATE TABLE "FunctionCall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastRun" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunctionCall_pkey" PRIMARY KEY ("id")
);
