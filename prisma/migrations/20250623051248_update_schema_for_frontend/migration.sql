/*
  Warnings:

  - You are about to drop the `notas` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "movimentacoes_estoque" ADD COLUMN     "notaId" INTEGER,
ADD COLUMN     "valorUnitario" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "notas";

-- CreateTable
CREATE TABLE "notas_movimentacao" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fornecedorId" INTEGER,
    "userId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,
    "motivo" TEXT,
    "destinatario" TEXT,
    "valorTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_nota_movimentacao" (
    "id" SERIAL NOT NULL,
    "notaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "valorUnitario" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_nota_movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notas_movimentacao_numero_key" ON "notas_movimentacao"("numero");

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "notas_movimentacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_movimentacao" ADD CONSTRAINT "notas_movimentacao_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_movimentacao" ADD CONSTRAINT "notas_movimentacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_nota_movimentacao" ADD CONSTRAINT "itens_nota_movimentacao_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "notas_movimentacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_nota_movimentacao" ADD CONSTRAINT "itens_nota_movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
