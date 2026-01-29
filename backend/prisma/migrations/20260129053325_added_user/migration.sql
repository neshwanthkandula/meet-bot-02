/*
  Warnings:

  - The values [FAILED] on the enum `MeetingStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[meetingUrl]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeetingStatus_new" AS ENUM ('UPCOMING', 'RUNNING', 'PROCESSING', 'COMPLETED');
ALTER TABLE "public"."Meeting" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Meeting" ALTER COLUMN "status" TYPE "MeetingStatus_new" USING ("status"::text::"MeetingStatus_new");
ALTER TYPE "MeetingStatus" RENAME TO "MeetingStatus_old";
ALTER TYPE "MeetingStatus_new" RENAME TO "MeetingStatus";
DROP TYPE "public"."MeetingStatus_old";
ALTER TABLE "Meeting" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_meetingUrl_key" ON "Meeting"("meetingUrl");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
