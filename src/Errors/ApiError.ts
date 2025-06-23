export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401);
  }
} 