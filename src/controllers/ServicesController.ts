import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import axios from 'axios';

export class ServicesController {
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

  async CallProdutosService(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      await this.verificarAuth(token!);

      const response = await axios.post('http://localhost:3333/api/service/produtos', {}, {
        headers: {
          'Authorization': token!
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
  async CallNotasService(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      await this.verificarAuth(token!);

      const response = await axios.post('http://localhost:3333/api/service/notas', {},{
        headers: {
          'Authorization': token!
        }
      });

    } catch (error) {
      console.error('Erro ao buscar nota:', error);
      if (error instanceof Error && error.message.includes('Token')) {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 