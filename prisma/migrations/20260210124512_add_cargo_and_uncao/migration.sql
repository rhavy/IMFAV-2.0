/*
  Warnings:

  - The values [PASTOR_A,OBREIRO_A,DIACONO_A,EVANGELISTA_A,PRESBITERO_A,MISSIONARIO_A] on the enum `user_uncao` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `uncao` ENUM('PASTOR', 'OBREIRO', 'DIACONO', 'EVANGELISTA', 'PRESBITERO', 'MISSIONARIO') NULL;
