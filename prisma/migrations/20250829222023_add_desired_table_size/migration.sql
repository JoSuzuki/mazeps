/*
  Warnings:

  - Added the required column `desiredTableSize` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Tournament` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "desiredTableSize" INTEGER NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
