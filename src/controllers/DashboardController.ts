import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class DashboardController {
  // Função auxiliar para verificar autenticação
  private async verificarAuth(token: string) {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Sessão inválida ou expirada');
    }

    return session;
  }

  // Obter estatísticas do dashboard
  async getStats(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      await this.verificarAuth(token!);

      // Contadores principais
      const totalProdutos = await prisma.produto.count({
        where: { active: true }
      });

      const totalNotas = await prisma.notaMovimentacao.count();

      const totalNotasEntrada = await prisma.notaMovimentacao.count({
        where: { tipo: 'ENTRADA' }
      });

      const totalNotasSaida = await prisma.notaMovimentacao.count({
        where: { tipo: 'SAIDA' }
      });

      // Produtos com baixo estoque (menos de 10 unidades)
      const produtosBaixoEstoque = await prisma.produto.findMany({
        where: {
          AND: [
            { active: true },
            { quantidade: { lte: 10 } }
          ]
        },
        orderBy: { quantidade: 'asc' },
        take: 10
      });

      // Produtos mais movimentados (que aparecem mais em notas)
      const produtosMaisMovimentados = await prisma.produto.findMany({
        where: { active: true },
        include: {
          itensNota: {
            include: {
              nota: true
            }
          }
        },
        take: 10
      });

      // Ordenar por quantidade de movimentações
      const produtosComMovimentacao = produtosMaisMovimentados
        .map(produto => ({
          ...produto,
          totalMovimentacoes: produto.itensNota.length
        }))
        .sort((a, b) => b.totalMovimentacoes - a.totalMovimentacoes)
        .slice(0, 5);

      // Notas recentes (últimas 10)
      const notasRecentes = await prisma.notaMovimentacao.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          },
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      // Valor total em estoque
      const produtos = await prisma.produto.findMany({
        where: { active: true },
        select: { preco: true, quantidade: true }
      });

      const valorTotalEstoque = produtos.reduce((total, produto) => {
        return total + (Number(produto.preco) * Number(produto.quantidade));
      }, 0);

      res.json({
        success: true,
        data: {
          contadores: {
            produtos: totalProdutos,
            notas: totalNotas,
            notasEntrada: totalNotasEntrada,
            notasSaida: totalNotasSaida,
            valorTotalEstoque: valorTotalEstoque
          },
          produtosBaixoEstoque,
          produtosMaisMovimentados: produtosComMovimentacao,
          notasRecentes
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
} 