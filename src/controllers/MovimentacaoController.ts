import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class MovimentacaoController {
  // Criar entrada de estoque
  async criarEntrada(req: Request, res: Response): Promise<any> {
    try {
      const {
        numeroNota,
        fornecedorId,
        data,
        observacoes,
        produtos // [{ produtoId, quantidade, valorUnitario }]
      } = req.body;

      // Obter userId do token (implementar middleware de auth depois)
      const userId = 1; // placeholder

      // Criar nota de movimentação
      const nota = await prisma.notaMovimentacao.create({
        data: {
          numero: numeroNota,
          tipo: 'ENTRADA',
          fornecedorId: fornecedorId || null,
          userId,
          data: new Date(data),
          observacoes,
          valorTotal: 0 // será calculado
        }
      });

      let valorTotal = 0;

      // Criar itens da nota e movimentações
      for (const item of produtos) {
        const valorItemTotal = Number(item.quantidade) * Number(item.valorUnitario);
        valorTotal += valorItemTotal;

        // Criar item da nota
        await prisma.itemNotaMovimentacao.create({
          data: {
            notaId: nota.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: valorItemTotal
          }
        });

        // Criar movimentação de estoque
        await prisma.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId,
            filialId: 1, // placeholder - pegar da sessão
            notaId: nota.id,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            observacao: `Entrada via nota ${numeroNota}`
          }
        });

        // Atualizar estoque
        const estoqueExistente = await prisma.estoque.findUnique({
          where: {
            produtoId_filialId: {
              produtoId: item.produtoId,
              filialId: 1
            }
          }
        });

        if (estoqueExistente) {
          await prisma.estoque.update({
            where: { id: estoqueExistente.id },
            data: {
              quantidade: {
                increment: item.quantidade
              }
            }
          });
        } else {
          await prisma.estoque.create({
            data: {
              produtoId: item.produtoId,
              filialId: 1,
              quantidade: item.quantidade
            }
          });
        }
      }

      // Atualizar valor total da nota
      await prisma.notaMovimentacao.update({
        where: { id: nota.id },
        data: { valorTotal }
      });

      res.status(201).json({
        success: true,
        message: 'Entrada criada com sucesso',
        data: { notaId: nota.id, valorTotal }
      });

    } catch (error) {
      console.error('Erro ao criar entrada:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Criar saída de estoque
  async criarSaida(req: Request, res: Response): Promise<any> {
    try {
      const {
        numeroNota,
        data,
        motivo,
        destinatario,
        observacoes,
        produtos // [{ produtoId, quantidade }]
      } = req.body;

      const userId = 1; // placeholder

      // Criar nota de movimentação
      const nota = await prisma.notaMovimentacao.create({
        data: {
          numero: numeroNota,
          tipo: 'SAIDA',
          userId,
          data: new Date(data),
          motivo,
          destinatario,
          observacoes
        }
      });

      // Criar itens da nota e movimentações
      for (const item of produtos) {
        // Verificar se há estoque suficiente
        const estoqueAtual = await prisma.estoque.findUnique({
          where: {
            produtoId_filialId: {
              produtoId: item.produtoId,
              filialId: 1
            }
          }
        });

        if (!estoqueAtual || estoqueAtual.quantidade < item.quantidade) {
          return res.status(400).json({
            success: false,
            error: `Estoque insuficiente para o produto ID ${item.produtoId}`
          });
        }

        // Criar item da nota
        await prisma.itemNotaMovimentacao.create({
          data: {
            notaId: nota.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: 0,
            valorTotal: 0
          }
        });

        // Criar movimentação de estoque
        await prisma.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId,
            filialId: 1,
            notaId: nota.id,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            observacao: `Saída via nota ${numeroNota} - ${motivo}`
          }
        });

        // Atualizar estoque
        await prisma.estoque.update({
          where: { id: estoqueAtual.id },
          data: {
            quantidade: {
              decrement: item.quantidade
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Saída criada com sucesso',
        data: { notaId: nota.id }
      });

    } catch (error) {
      console.error('Erro ao criar saída:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Listar movimentações com filtros
  async listarMovimentacoes(req: Request, res: Response): Promise<any> {
    try {
      const { 
        tipo, 
        produtoId, 
        dataInicio, 
        dataFim, 
        page = 1, 
        limit = 20 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (tipo && tipo !== 'Todos') {
        where.tipo = tipo;
      }

      if (produtoId && produtoId !== 'Todos os produtos') {
        where.produtoId = Number(produtoId);
      }

      if (dataInicio) {
        where.dataMovimento = {
          gte: new Date(dataInicio as string)
        };
      }

      if (dataFim) {
        where.dataMovimento = {
          ...where.dataMovimento,
          lte: new Date(dataFim as string)
        };
      }

      const [movimentacoes, total] = await Promise.all([
        prisma.movimentacaoEstoque.findMany({
          where,
          include: {
            produto: true,
            filial: true,
            nota: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.movimentacaoEstoque.count({ where })
      ]);

      // Calcular estatísticas
      const entradas = await prisma.movimentacaoEstoque.count({
        where: { ...where, tipo: 'ENTRADA' }
      });

      const saidas = await prisma.movimentacaoEstoque.count({
        where: { ...where, tipo: 'SAIDA' }
      });

      res.json({
        success: true,
        data: {
          movimentacoes,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          },
          estatisticas: {
            total,
            entradas,
            saidas,
            saldo: entradas - saidas
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
} 