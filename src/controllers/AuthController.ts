import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { ApiError } from '../Errors/ApiError';

export class AuthController {
  // Registro de usuário (baseado no registerApi.php)
  async register(req: Request, res: Response): Promise<any> {
    try {
      const { email, senhaLogin } = req.body;

      // Validação se os campos estão vazios
      if (!email || !senhaLogin) {
        return res.status(400).json({ error: 'Preencha todas as informações.' });
      }

      // Verifica se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'Usuário já cadastrado.' 
        });
      }

      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(senhaLogin, 10);

      // Cria o usuário
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0] // Usar parte do email como nome
        }
      });

      res.status(201).json({
        success: true,
        message: 'Usuário Cadastrado!'
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao cadastrar.' 
      });
    }
  }

  // Login de usuário (baseado no loginApi.php)
  async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, senhaLogin } = req.body;

      // Validação se os campos estão vazios
      if (!email || !senhaLogin) {
        return res.status(400).json({ error: 'Preencha todas as informações.' });
      }

      // Busca o usuário no banco
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(senhaLogin, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gera token de sessão
      const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Cria sessão no banco
      await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt
        }
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          login: user.email
        },
        token: sessionToken
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Verificação de sessão (baseado no checkSession.php)
  async checkSession(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ logged_in: false });
      }

      // Busca a sessão no banco
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        // Remove sessão expirada
        if (session) {
          await prisma.session.delete({ where: { id: session.id } });
        }
        return res.status(401).json({ logged_in: false });
      }

      res.json({
        logged_in: true,
        user_id: session.user.id,
        user_login: session.user.email
      });

    } catch (error) {
      console.error('Erro na verificação de sessão:', error);
      res.status(500).json({ logged_in: false });
    }
  }

  // Logout
  async logout(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        await prisma.session.deleteMany({
          where: { token }
        });
      }

      res.json({ success: true, message: 'Logout realizado com sucesso' });

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter dados do usuário atual
  async me(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada' });
      }

      res.json({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        active: session.user.active,
        ultimoAcesso: session.createdAt
      });

    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Editar perfil do usuário
  async editarPerfil(req: Request, res: Response): Promise<any> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const { name, email } = req.body;

      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada' });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email !== session.user.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      // Atualizar usuário
      const usuarioAtualizado = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          email
        }
      });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          id: usuarioAtualizado.id,
          email: usuarioAtualizado.email,
          name: usuarioAtualizado.name,
          active: usuarioAtualizado.active
        }
      });

    } catch (error) {
      console.error('Erro ao editar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Endpoint para inserir notas (baseado no insertNote.php - ainda vazio)
  async insertNote(req: Request, res: Response): Promise<any> {
    try {
      // Verificar autenticação
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada' });
      }

      // Aqui você pode adicionar a lógica para inserir notas
      // Por enquanto, apenas retorna sucesso
      res.json({
        success: true,
        message: 'Endpoint de inserção de notas - implementar conforme necessário',
        user_id: session.user.id
      });

    } catch (error) {
      console.error('Erro ao inserir nota:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 