import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class FornecedorController {
  // Listar fornecedores
  async listar(req: Request, res: Response): Promise<any> {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { active: true };

      if (search) {
        where.OR = [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { cnpj: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [fornecedores, total] = await Promise.all([
        prisma.fornecedor.findMany({
          where,
          orderBy: { nome: 'asc' },
          skip,
          take: Number(limit)
        }),
        prisma.fornecedor.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          fornecedores,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar fornecedor por ID
  async buscarPorId(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      const fornecedor = await prisma.fornecedor.findUnique({
        where: { id: Number(id) }
      });

      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          error: 'Fornecedor não encontrado'
        });
      }

      res.json({
        success: true,
        data: fornecedor
      });

    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Criar fornecedor
  async criar(req: Request, res: Response): Promise<any> {
    try {
      const {
        nome,
        cnpj,
        endereco,
        telefone,
        email
      } = req.body;

      const fornecedor = await prisma.fornecedor.create({
        data: {
          nome,
          cnpj,
          endereco,
          telefone,
          email
        }
      });

      res.status(201).json({
        success: true,
        message: 'Fornecedor criado com sucesso',
        data: fornecedor
      });

    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
} 