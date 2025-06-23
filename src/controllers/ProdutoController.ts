import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ProdutoController {
  // Listar produtos
  async listar(req: Request, res: Response): Promise<any> {
    try {
      const { page = 1, limit = 20, search, categoriaId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { active: true };

      if (search) {
        where.OR = [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { codigo: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (categoriaId) {
        where.categoriaId = Number(categoriaId);
      }

      const [produtos, total] = await Promise.all([
        prisma.produto.findMany({
          where,
          include: {
            categoria: true,
            empresa: true,
            estoque: {
              include: {
                filial: true
              }
            }
          },
          orderBy: { nome: 'asc' },
          skip,
          take: Number(limit)
        }),
        prisma.produto.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          produtos,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar produto por ID
  async buscarPorId(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      const produto = await prisma.produto.findUnique({
        where: { id: Number(id) },
        include: {
          categoria: true,
          empresa: true,
          estoque: {
            include: {
              filial: true
            }
          }
        }
      });

      if (!produto) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      res.json({
        success: true,
        data: produto
      });

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Criar produto
  async criar(req: Request, res: Response): Promise<any> {
    try {
      const {
        codigo,
        nome,
        descricao,
        categoriaId,
        unidade,
        preco,
        empresaId = 1 // placeholder
      } = req.body;

      const produto = await prisma.produto.create({
        data: {
          codigo,
          nome,
          descricao,
          categoriaId: categoriaId || null,
          unidade,
          preco,
          empresaId
        },
        include: {
          categoria: true,
          empresa: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: produto
      });

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
} 