-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('CONFIRMED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'CONFIRMED',
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
