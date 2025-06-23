import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class DashboardController {
  // Obter estatísticas do dashboard
  async getStats(req: Request, res: Response): Promise<any> {
    try {
      // Contadores principais
      const totalProdutos = await prisma.produto.count({
        where: { active: true }
      });

      const totalEntradas = await prisma.movimentacaoEstoque.count({
        where: { tipo: 'ENTRADA' }
      });

      const totalSaidas = await prisma.movimentacaoEstoque.count({
        where: { tipo: 'SAIDA' }
      });

      // Produtos com baixo estoque
      const produtosBaixoEstoque = await prisma.estoque.findMany({
        where: {
          quantidade: {
            lte: 10 // quantidade baixa
          }
        },
        include: {
          produto: true,
          filial: true
        },
        take: 10
      });

      // Movimentações recentes (últimas 10)
      const movimentacoesRecentes = await prisma.movimentacaoEstoque.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          produto: true,
          filial: true
        }
      });

      res.json({
        success: true,
        data: {
          contadores: {
            produtos: totalProdutos,
            entradas: totalEntradas,
            saidas: totalSaidas
          },
          produtosBaixoEstoque,
          movimentacoesRecentes
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
} 