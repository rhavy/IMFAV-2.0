/*
  Warnings:

  - You are about to drop the column `diciplinado` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `disciplinaIncio` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `disciplinaMotivo` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `disciplinaObs` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `disciplinaTermina` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `diciplinado`,
    DROP COLUMN `disciplinaIncio`,
    DROP COLUMN `disciplinaMotivo`,
    DROP COLUMN `disciplinaObs`,
    DROP COLUMN `disciplinaTermina`;
