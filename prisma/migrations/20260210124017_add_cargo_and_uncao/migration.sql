/*
  Warnings:

  - You are about to alter the column `name` on the `cargo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `cargo` MODIFY `name` ENUM('ADMIN', 'SECRETARIA') NOT NULL;
