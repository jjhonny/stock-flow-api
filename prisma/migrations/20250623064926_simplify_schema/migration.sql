/*
  Warnings:

  - You are about to drop the column `fornecedorId` on the `notas_movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaId` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `hierarquia_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `empresas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estoque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `filiais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fornecedores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movimentacoes_estoque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_empresas` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "estoque" DROP CONSTRAINT "estoque_filialId_fkey";

-- DropForeignKey
ALTER TABLE "estoque" DROP CONSTRAINT "estoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "filiais" DROP CONSTRAINT "filiais_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "movimentacoes_estoque" DROP CONSTRAINT "movimentacoes_estoque_filialId_fkey";

-- DropForeignKey
ALTER TABLE "movimentacoes_estoque" DROP CONSTRAINT "movimentacoes_estoque_notaId_fkey";

-- DropForeignKey
ALTER TABLE "movimentacoes_estoque" DROP CONSTRAINT "movimentacoes_estoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "notas_movimentacao" DROP CONSTRAINT "notas_movimentacao_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "user_empresas" DROP CONSTRAINT "user_empresas_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "user_empresas" DROP CONSTRAINT "user_empresas_userId_fkey";

-- DropIndex
DROP INDEX "produtos_empresaId_codigo_key";

-- AlterTable
ALTER TABLE "notas_movimentacao" DROP COLUMN "fornecedorId";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "categoriaId",
DROP COLUMN "empresaId",
ADD COLUMN     "quantidade" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "hierarquia_id";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "empresas";

-- DropTable
DROP TABLE "estoque";

-- DropTable
DROP TABLE "filiais";

-- DropTable
DROP TABLE "fornecedores";

-- DropTable
DROP TABLE "movimentacoes_estoque";

-- DropTable
DROP TABLE "user_empresas";

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");
