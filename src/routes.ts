import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { DashboardController } from './controllers/DashboardController';
import { MovimentacaoController } from './controllers/MovimentacaoController';
import { ProdutoController } from './controllers/ProdutoController';
import { FornecedorController } from './controllers/FornecedorController';

const router = Router();
const authController = new AuthController();
const dashboardController = new DashboardController();
const movimentacaoController = new MovimentacaoController();
const produtoController = new ProdutoController();
const fornecedorController = new FornecedorController();

// Rotas básicas
router.get('/', (req, res) => {
  res.json({
    message: 'Backend StockFlow API',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      auth: '/auth/*',
      dashboard: '/dashboard/*',
      produtos: '/produtos',
      fornecedores: '/fornecedores',
      movimentacoes: '/movimentacoes'
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas de autenticação
router.post('/auth/register', async (req, res) => {
  await authController.register(req, res);
});

router.post('/auth/login', async (req, res) => {
  await authController.login(req, res);
});

router.get('/auth/check-session', async (req, res) => {
  await authController.checkSession(req, res);
});

router.post('/auth/logout', async (req, res) => {
  await authController.logout(req, res);
});

router.get('/auth/me', async (req, res) => {
  await authController.me(req, res);
});

router.put('/auth/profile', async (req, res) => {
  await authController.editarPerfil(req, res);
});

// Notas
router.post('/notes/insert', async (req, res) => {
  await authController.insertNote(req, res);
});

// Dashboard
router.get('/dashboard/stats', async (req, res) => {
  await dashboardController.getStats(req, res);
});

// Produtos
router.get('/produtos', async (req, res) => {
  await produtoController.listar(req, res);
});

router.get('/produtos/:id', async (req, res) => {
  await produtoController.buscarPorId(req, res);
});

router.post('/produtos', async (req, res) => {
  await produtoController.criar(req, res);
});

// Fornecedores
router.get('/fornecedores', async (req, res) => {
  await fornecedorController.listar(req, res);
});

router.get('/fornecedores/:id', async (req, res) => {
  await fornecedorController.buscarPorId(req, res);
});

router.post('/fornecedores', async (req, res) => {
  await fornecedorController.criar(req, res);
});

// Movimentações de Estoque
router.post('/movimentacoes/entrada', async (req, res) => {
  await movimentacaoController.criarEntrada(req, res);
});

router.post('/movimentacoes/saida', async (req, res) => {
  await movimentacaoController.criarSaida(req, res);
});

router.get('/movimentacoes', async (req, res) => {
  await movimentacaoController.listarMovimentacoes(req, res);
});

export { router }; 