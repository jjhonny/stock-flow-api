import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class NotasController {
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

  // Criar nota de entrada
  async criarNotaEntrada(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const session = await this.verificarAuth(token!);

      const { numero, observacoes, motivo, destinatario, produtos } = req.body;

      if (!numero || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ 
          error: 'Número da nota e produtos são obrigatórios' 
        });
      }

      // Verificar se o número da nota já existe
      const notaExistente = await prisma.notaMovimentacao.findUnique({
        where: { numero }
      });

      if (notaExistente) {
        return res.status(400).json({ 
          error: 'Número da nota já existe' 
        });
      }

      let valorTotal = 0;

      // Criar ou verificar produtos
      const produtosProcessados = [];
      for (const produtoData of produtos) {
        const { codigo, nome, descricao, unidade, preco, quantidade } = produtoData;

        if (!codigo || !nome || quantidade <= 0) {
          return res.status(400).json({ 
            error: `Produto com código ${codigo}: código, nome e quantidade são obrigatórios` 
          });
        }

        // Verificar se produto já existe
        let produto = await prisma.produto.findUnique({
          where: { codigo }
        });

        // Se não existe, criar
        if (!produto) {
          produto = await prisma.produto.create({
            data: {
              codigo,
              nome,
              descricao: descricao || '',
              unidade: unidade || 'UN',
              preco: preco || 0,
              quantidade: 0 // Será atualizado depois
            }
          });
        }

        const valorUnitarioFinal = preco || Number(produto.preco);
        const valorTotalItem = valorUnitarioFinal * quantidade;
        valorTotal += valorTotalItem;

        produtosProcessados.push({
          produtoId: produto.id,
          quantidade,
          valorUnitario: valorUnitarioFinal,
          valorTotal: valorTotalItem
        });
      }

      // Criar nota
      const nota = await prisma.notaMovimentacao.create({
        data: {
          numero,
          tipo: 'ENTRADA',
          userId: session.user.id,
          observacoes,
          motivo,
          destinatario,
          valorTotal,
          itens: {
            create: produtosProcessados
          }
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      // Atualizar estoque dos produtos
      for (const item of nota.itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: {
              increment: item.quantidade
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Nota de entrada criada com sucesso',
        data: nota
      });

    } catch (error) {
      console.error('Erro ao criar nota de entrada:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nota de saída
  async criarNotaSaida(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const session = await this.verificarAuth(token!);

      const { numero, observacoes, motivo, destinatario, produtos } = req.body;

      if (!numero || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ 
          error: 'Número da nota e produtos são obrigatórios' 
        });
      }

      // Verificar se o número da nota já existe
      const notaExistente = await prisma.notaMovimentacao.findUnique({
        where: { numero }
      });

      if (notaExistente) {
        return res.status(400).json({ 
          error: 'Número da nota já existe' 
        });
      }

      let valorTotal = 0;
      const itensNota = [];

      // Verificar disponibilidade e preparar itens
      for (const produtoData of produtos) {
        const { codigo, quantidade } = produtoData;

        if (!codigo || quantidade <= 0) {
          return res.status(400).json({ 
            error: `Código e quantidade são obrigatórios para todos os produtos` 
          });
        }

        const produto = await prisma.produto.findUnique({
          where: { codigo }
        });

        if (!produto) {
          return res.status(400).json({ 
            error: `Produto com código ${codigo} não encontrado` 
          });
        }

        if (Number(produto.quantidade) < quantidade) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para produto ${produto.nome}. Disponível: ${produto.quantidade}, Solicitado: ${quantidade}` 
          });
        }

        const valorTotalItem = Number(produto.preco) * quantidade;
        valorTotal += valorTotalItem;

        itensNota.push({
          produtoId: produto.id,
          quantidade,
          valorUnitario: Number(produto.preco),
          valorTotal: valorTotalItem
        });
      }

      // Criar nota
      const nota = await prisma.notaMovimentacao.create({
        data: {
          numero,
          tipo: 'SAIDA',
          userId: session.user.id,
          observacoes,
          motivo,
          destinatario,
          valorTotal,
          itens: {
            create: itensNota
          }
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      // Atualizar estoque dos produtos
      for (const item of nota.itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: {
              decrement: item.quantidade
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Nota de saída criada com sucesso',
        data: nota
      });

    } catch (error) {
      console.error('Erro ao criar nota de saída:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar notas
  async listarNotas(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      await this.verificarAuth(token!);

      const { page = 1, limit = 10, tipo, numero } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (tipo) where.tipo = tipo;
      if (numero) where.numero = { contains: numero as string };

      const notas = await prisma.notaMovimentacao.findMany({
        where,
        skip,
        take: Number(limit),
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

      const total = await prisma.notaMovimentacao.count({ where });

      res.json({
        success: true,
        data: notas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Erro ao listar notas:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar nota por ID
  async buscarNotaPorId(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      await this.verificarAuth(token!);

      const { id } = req.params;

      const nota = await prisma.notaMovimentacao.findUnique({
        where: { id: Number(id) },
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

      if (!nota) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }

      res.json({
        success: true,
        data: nota
      });

    } catch (error) {
      console.error('Erro ao buscar nota:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Saída parcial de produtos de uma nota
  async saidaParcialProdutos(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const session = await this.verificarAuth(token!);

      const { id } = req.params;
      const { produtos, observacoes, numeroNotaSaida } = req.body;

      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ 
          error: 'Lista de produtos é obrigatória' 
        });
      }

      if (!numeroNotaSaida) {
        return res.status(400).json({ 
          error: 'Número da nota de saída é obrigatório' 
        });
      }

      // Verificar se a nota existe
      const notaOriginal = await prisma.notaMovimentacao.findUnique({
        where: { id: Number(id) },
        include: { itens: { include: { produto: true } } }
      });

      if (!notaOriginal) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }

      // Verificar se o número da nova nota já existe
      const notaExistente = await prisma.notaMovimentacao.findUnique({
        where: { numero: numeroNotaSaida }
      });

      if (notaExistente) {
        return res.status(400).json({ 
          error: 'Número da nota de saída já existe' 
        });
      }

      let valorTotal = 0;
      const itensNota = [];

      // Verificar disponibilidade e preparar itens
      for (const produtoSaida of produtos) {
        const { codigo, quantidade } = produtoSaida;

        if (!codigo || quantidade <= 0) {
          return res.status(400).json({ 
            error: `Código e quantidade são obrigatórios para todos os produtos` 
          });
        }

        const produto = await prisma.produto.findUnique({
          where: { codigo }
        });

        if (!produto) {
          return res.status(400).json({ 
            error: `Produto com código ${codigo} não encontrado` 
          });
        }

        if (Number(produto.quantidade) < quantidade) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para produto ${produto.nome}. Disponível: ${produto.quantidade}, Solicitado: ${quantidade}` 
          });
        }

        const valorTotalItem = Number(produto.preco) * quantidade;
        valorTotal += valorTotalItem;

        itensNota.push({
          produtoId: produto.id,
          quantidade,
          valorUnitario: Number(produto.preco),
          valorTotal: valorTotalItem
        });
      }

      // Criar nova nota de saída
      const novaNota = await prisma.notaMovimentacao.create({
        data: {
          numero: numeroNotaSaida,
          tipo: 'SAIDA',
          userId: session.user.id,
          observacoes: `Saída parcial da nota ${notaOriginal.numero}. ${observacoes || ''}`,
          motivo: 'SAIDA_PARCIAL',
          valorTotal,
          itens: {
            create: itensNota
          }
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      // Atualizar estoque dos produtos
      for (const item of novaNota.itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: {
              decrement: item.quantidade
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Saída parcial realizada com sucesso',
        data: novaNota
      });

    } catch (error) {
      console.error('Erro ao realizar saída parcial:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 