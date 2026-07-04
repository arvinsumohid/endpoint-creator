/*
  Warnings:

  - You are about to drop the column `body` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `Endpoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "body",
DROP COLUMN "method",
DROP COLUMN "response",
ADD COLUMN     "pathParams" TEXT,
ADD COLUMN     "queryParams" TEXT,
ADD COLUMN     "requestBody" TEXT,
ADD COLUMN     "responseBody" TEXT,
ADD COLUMN     "statusCode" INTEGER;
