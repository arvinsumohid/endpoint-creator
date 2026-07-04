/*
  Warnings:

  - You are about to drop the column `link` on the `Endpoint` table. All the data in the column will be lost.
  - Added the required column `path` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "link",
ADD COLUMN     "path" TEXT NOT NULL;
