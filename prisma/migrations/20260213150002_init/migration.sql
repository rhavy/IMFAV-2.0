-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `planId` INTEGER NULL DEFAULT 1,
    `cpf` VARCHAR(191) NULL,
    `userRoles` VARCHAR(191) NULL DEFAULT 'CLIENTE',
    `sexo` ENUM('MASCULINO', 'FEMININO') NULL,
    `scheduledDeletion` DATETIME(3) NULL,
    `motivoSaida` VARCHAR(191) NULL,
    `uncao` ENUM('PASTOR', 'OBREIRO', 'DIACONO', 'EVANGELISTA', 'PRESBITERO', 'MISSIONARIO') NULL,
    `telefone` VARCHAR(191) NULL,
    `nascimento` DATETIME(3) NULL,
    `blockedAt` DATETIME(3) NULL,
    `blockedByUserId` VARCHAR(191) NULL,
    `blockedReason` VARCHAR(191) NULL,
    `status` ENUM('ATIVO', 'INATIVO', 'BLOQUEADO', 'DELETADO') NOT NULL DEFAULT 'ATIVO',
    `uncaoVerified` BOOLEAN NOT NULL DEFAULT false,
    `congregacao` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_blockedByUserId_fkey`(`blockedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `tema` VARCHAR(191) NOT NULL,
    `origem` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFim` VARCHAR(191) NOT NULL,
    `libracao` BOOLEAN NOT NULL DEFAULT false,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'CONGRESSO',
    `idcadastrado` VARCHAR(191) NOT NULL,

    INDEX `eventos_idcadastrado_fkey`(`idcadastrado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `igreja` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rua` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `pais` VARCHAR(191) NOT NULL,
    `criadoPorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `igreja_criadoPorId_fkey`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `convidado` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `uncao` ENUM('PASTOR', 'OBREIRO', 'DIACONO', 'EVANGELISTA', 'PRESBITERO', 'MISSIONARIO') NOT NULL,
    `cargoId` VARCHAR(191) NOT NULL,
    `funcao` VARCHAR(191) NOT NULL,
    `eventoId` VARCHAR(191) NOT NULL,

    INDEX `convidado_cargoId_fkey`(`cargoId`),
    INDEX `convidado_eventoId_fkey`(`eventoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargo` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL DEFAULT 'blue-500',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `session_token_key`(`token`),
    INDEX `session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `account_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL DEFAULT 'User',
    `entityId` VARCHAR(191) NOT NULL,
    `oldValue` LONGTEXT NULL,
    `newValue` LONGTEXT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `motivo` VARCHAR(191) NULL,
    `observacao` TEXT NULL,
    `tempoDisciplina` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_eventosdirigentes` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_eventosdirigentes_AB_unique`(`A`, `B`),
    INDEX `_eventosdirigentes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_userigreja` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_userigreja_AB_unique`(`A`, `B`),
    INDEX `_userigreja_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserToCargo` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserToCargo_AB_unique`(`A`, `B`),
    INDEX `_UserToCargo_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_grouptouser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_grouptouser_AB_unique`(`A`, `B`),
    INDEX `_grouptouser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_blockedByUserId_fkey` FOREIGN KEY (`blockedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_idcadastrado_fkey` FOREIGN KEY (`idcadastrado`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `igreja` ADD CONSTRAINT `igreja_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `convidado` ADD CONSTRAINT `convidado_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `convidado` ADD CONSTRAINT `convidado_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_eventosdirigentes` ADD CONSTRAINT `_eventosdirigentes_A_fkey` FOREIGN KEY (`A`) REFERENCES `eventos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_eventosdirigentes` ADD CONSTRAINT `_eventosdirigentes_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_userigreja` ADD CONSTRAINT `_userigreja_A_fkey` FOREIGN KEY (`A`) REFERENCES `igreja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_userigreja` ADD CONSTRAINT `_userigreja_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToCargo` ADD CONSTRAINT `_UserToCargo_A_fkey` FOREIGN KEY (`A`) REFERENCES `cargo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToCargo` ADD CONSTRAINT `_UserToCargo_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_grouptouser` ADD CONSTRAINT `_grouptouser_A_fkey` FOREIGN KEY (`A`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_grouptouser` ADD CONSTRAINT `_grouptouser_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
