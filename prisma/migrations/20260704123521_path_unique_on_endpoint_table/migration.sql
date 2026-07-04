/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Endpoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_path_key" ON "Endpoint"("path");
