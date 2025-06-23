import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../Errors/ApiError';
import { ErrorResponse } from '../@types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof ApiError) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message,
      message: 'Erro na operação',
      timestamp: new Date().toISOString()
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Erro genérico
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Erro interno do servidor',
    message: 'Algo deu errado!',
    timestamp: new Date().toISOString()
  };

  console.error('Erro:', error.stack);
  res.status(500).json(errorResponse);
}; 