import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { NotasController } from './controllers/NotasController';
import { DashboardController } from './controllers/DashboardController';

const router = Router();
const authController = new AuthController();
const notasController = new NotasController();
const dashboardController = new DashboardController();

// Rotas básicas
router.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Controle de Estoque Simples',
    version: '2.0.0',
    status: 'OK',
    endpoints: {
      auth: '/auth/*',
      dashboard: '/dashboard/*',
      notas: '/notas/*'
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

router.get('/auth/me', async (req, res) => {
  await authController.me(req, res);
});

router.put('/auth/profile', async (req, res) => {
  await authController.editarPerfil(req, res);
});

// Dashboard
router.get('/dashboard/stats', async (req, res) => {
  await dashboardController.getStats(req, res);
});

// Rotas de notas
router.post('/notas/entrada', async (req, res) => {
  await notasController.criarNotaEntrada(req, res);
});

router.post('/notas/saida', async (req, res) => {
  await notasController.criarNotaSaida(req, res);
});

router.get('/notas', async (req, res) => {
  await notasController.listarNotas(req, res);
});

router.get('/notas/:id', async (req, res) => {
  await notasController.buscarNotaPorId(req, res);
});

router.post('/notas/:id/saida-parcial', async (req, res) => {
  await notasController.saidaParcialProdutos(req, res);
});

export { router }; 