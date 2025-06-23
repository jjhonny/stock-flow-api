import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpService {
  private api: AxiosInstance;

  constructor(baseURL?: string, timeout: number = 10000) {
    this.api = axios.create({
      baseURL: baseURL || process.env.API_BASE_URL || 'https://api.exemplo.com',
      timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Interceptor de requisição
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 Fazendo requisição para: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor de resposta
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Resposta recebida de: ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('Erro na resposta:', error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  // Método para configurar token de autorização
  public setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Método para remover token de autorização
  public removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Método para adicionar headers customizados
  public setCustomHeaders(headers: Record<string, string>): void {
    Object.keys(headers).forEach(key => {
      this.api.defaults.headers.common[key] = headers[key];
    });
  }
} 