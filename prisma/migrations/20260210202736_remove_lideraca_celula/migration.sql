/*
  Warnings:

  - You are about to drop the `_celulatouser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_liderancatouser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `celula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lideranca` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_celulatouser` DROP FOREIGN KEY `_CelulaToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_celulatouser` DROP FOREIGN KEY `_CelulaToUser_B_fkey`;

-- DropForeignKey
ALTER TABLE `_liderancatouser` DROP FOREIGN KEY `_LiderancaToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_liderancatouser` DROP FOREIGN KEY `_LiderancaToUser_B_fkey`;

-- DropTable
DROP TABLE `_celulatouser`;

-- DropTable
DROP TABLE `_liderancatouser`;

-- DropTable
DROP TABLE `celula`;

-- DropTable
DROP TABLE `lideranca`;
