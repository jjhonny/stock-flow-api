import express, { Application } from 'express';
import cors from 'cors';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';

class Server {
  public app: Application;
  private PORT: string | number;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use('/', router);
  }

  private errorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${this.PORT}`);
      console.log(`📍 Acesse: http://localhost:${this.PORT}`);
    });
  }
}

export default Server; 