-- AlterTable
ALTER TABLE `user` ADD COLUMN `blockedAt` DATETIME(3) NULL,
    ADD COLUMN `blockedByUserId` VARCHAR(191) NULL,
    ADD COLUMN `blockedReason` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_blockedByUserId_fkey` FOREIGN KEY (`blockedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
