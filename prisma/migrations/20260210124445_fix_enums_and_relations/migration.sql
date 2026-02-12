/*
  Warnings:

  - You are about to drop the column `uncaoAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `uncaoAt`,
    ADD COLUMN `uncao` ENUM('PASTOR_A', 'OBREIRO_A', 'DIACONO_A', 'EVANGELISTA_A', 'PRESBITERO_A', 'MISSIONARIO_A') NULL;
