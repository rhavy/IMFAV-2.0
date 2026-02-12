/*
  Warnings:

  - You are about to drop the column `ativo` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `log` ADD COLUMN `motivo` VARCHAR(191) NULL,
    ADD COLUMN `observacao` TEXT NULL,
    ADD COLUMN `tempoDisciplina` VARCHAR(191) NULL,
    MODIFY `entityType` VARCHAR(191) NOT NULL DEFAULT 'User';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `ativo`,
    DROP COLUMN `deletedAt`,
    ADD COLUMN `diciplinado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `disciplinaIncio` DATETIME(3) NULL,
    ADD COLUMN `disciplinaMotivo` VARCHAR(191) NULL,
    ADD COLUMN `disciplinaObs` TEXT NULL,
    ADD COLUMN `disciplinaTermina` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('ATIVO', 'INATIVO', 'BLOQUEADO', 'DELETADO') NOT NULL DEFAULT 'ATIVO';
