# Backend StockFlow - API REST

API backend desenvolvida em Node.js com Express e TypeScript para sistema de controle de estoque de frigorífico.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript com tipagem
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **bcryptjs** - Criptografia de senhas
- **Helmet** - Middleware de segurança
- **CORS** - Controle de acesso entre origens
- **Morgan** - Logger de requisições HTTP

## 📦 Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd backend-stockflow
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
   - Crie um arquivo `.env` na raiz do projeto:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/stockflow?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

4. Gere o cliente do Prisma e rode as migrações:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 🏃‍♂️ Como Executar

### Desenvolvimento
```bash
npm run dev
```
Servidor disponível em: `http://localhost:3000`

### Produção
```bash
# Compilar o TypeScript
npm run build

# Executar a aplicação compilada
npm start
```

## 📋 Documentação Completa da API

### Base URL
```
http://localhost:3000
```

---

## 🏠 **Rotas Básicas**

### **GET** `/` - Informações da API
Retorna informações básicas da API e endpoints disponíveis.

**Response Success (200):**
```json
{
  "message": "Backend StockFlow API",
  "version": "1.0.0",
  "status": "OK",
  "endpoints": {
    "auth": "/auth/*",
    "dashboard": "/dashboard/*",
    "produtos": "/produtos",
    "fornecedores": "/fornecedores",
    "movimentacoes": "/movimentacoes"
  }
}
```

---

### **GET** `/health` - Health Check
Verifica se a API está funcionando corretamente.

**Response Success (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

---

## 🔐 **Autenticação**

### **POST** `/auth/register` - Registrar usuário
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "senhaLogin": "123456"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Usuário Cadastrado!"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Usuário já cadastrado."
}
```

---

### **POST** `/auth/login` - Login
Autentica o usuário e retorna token de acesso.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "senhaLogin": "123456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "login": "joao@exemplo.com"
  },
  "token": "abc123xyz789def456"
}
```

**Response Error (401):**
```json
{
  "error": "Usuário não encontrado"
}
```

---

### **GET** `/auth/check-session` - Verificar sessão
Verifica se o token de sessão é válido.

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Response Success (200):**
```json
{
  "logged_in": true,
  "user_id": 1,
  "user_login": "joao@exemplo.com"
}
```

**Response Error (401):**
```json
{
  "logged_in": false
}
```

---

### **POST** `/auth/logout` - Logout
Invalida a sessão atual do usuário.

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### **GET** `/auth/me` - Dados do usuário atual
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Response Success (200):**
```json
{
  "id": 1,
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "active": true,
  "ultimoAcesso": "2024-01-20T10:30:00Z"
}
```

---

### **PUT** `/auth/profile` - Editar perfil
Atualiza informações do perfil do usuário.

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Request Body:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.silva@exemplo.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "data": {
    "id": 1,
    "name": "João Silva Santos",
    "email": "joao.silva@exemplo.com"
  }
}
```

---

## 📝 **Notas**

### **POST** `/notes/insert` - Inserir nota
Insere uma nova nota no sistema (endpoint em desenvolvimento).

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Request Body:**
```json
{
  "titulo": "Nota de exemplo",
  "conteudo": "Conteúdo da nota",
  "tipo": "INFORMACAO"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Endpoint de inserção de notas - implementar conforme necessário",
  "user_id": 1
}
```

---

## 📊 **Dashboard**

### **GET** `/dashboard/stats` - Estatísticas gerais
Retorna estatísticas do sistema.

**Headers:**
```
Authorization: Bearer abc123xyz789def456
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "totalProdutos": 150,
    "totalFornecedores": 25,
    "movimentacoes": 500,
    "valorEstoque": 125000.50
  }
}
```

---

## 📦 **Produtos**

### **GET** `/produtos` - Listar produtos
Lista produtos com paginação e filtros.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `search` (opcional): Busca por nome ou código
- `categoriaId` (opcional): Filtro por categoria

**Exemplo:**
```
GET /produtos?page=1&limit=10&search=carne&categoriaId=1
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "produtos": [
      {
        "id": 1,
        "codigo": "PROD001",
        "nome": "Alcatra",
        "descricao": "Corte premium de alcatra",
        "preco": 35.90,
        "unidade": "KG",
        "categoria": {
          "id": 1,
          "nome": "Carnes Bovinas"
        },
        "estoque": [
          {
            "id": 1,
            "quantidade": 50,
            "filial": {
              "id": 1,
              "nome": "Filial Centro"
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "pages": 15
    }
  }
}
```

---

### **GET** `/produtos/:id` - Buscar produto por ID
Retorna detalhes de um produto específico.

**Exemplo:**
```
GET /produtos/1
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "PROD001",
    "nome": "Alcatra",
    "descricao": "Corte premium de alcatra",
    "preco": 35.90,
    "unidade": "KG",
    "categoria": {
      "id": 1,
      "nome": "Carnes Bovinas"
    },
    "estoque": [
      {
        "id": 1,
        "quantidade": 50,
        "filial": {
          "id": 1,
          "nome": "Filial Centro"
        }
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Produto não encontrado"
}
```

---

### **POST** `/produtos` - Criar produto
Cria um novo produto.

**Request Body:**
```json
{
  "codigo": "PROD002",
  "nome": "Picanha",
  "descricao": "Corte nobre de picanha",
  "categoriaId": 1,
  "unidade": "KG",
  "preco": 65.90,
  "empresaId": 1
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Produto criado com sucesso",
  "data": {
    "id": 2,
    "codigo": "PROD002",
    "nome": "Picanha",
    "descricao": "Corte nobre de picanha",
    "preco": 65.90,
    "unidade": "KG",
    "categoria": {
      "id": 1,
      "nome": "Carnes Bovinas"
    }
  }
}
```

---

## 🏢 **Fornecedores**

### **GET** `/fornecedores` - Listar fornecedores
Lista fornecedores com paginação e filtros.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `search` (opcional): Busca por nome, CNPJ ou razão social

**Exemplo:**
```
GET /fornecedores?page=1&limit=10&search=frigorífico
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "fornecedores": [
      {
        "id": 1,
        "razaoSocial": "Frigorífico São Paulo LTDA",
        "nomeFantasia": "FrigoSP",
        "cnpj": "12.345.678/0001-90",
        "email": "contato@frigosp.com.br",
        "telefone": "(11) 1234-5678",
        "endereco": "Rua das Empresas, 123",
        "cidade": "São Paulo",
        "estado": "SP"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### **GET** `/fornecedores/:id` - Buscar fornecedor por ID
Retorna detalhes de um fornecedor específico.

**Exemplo:**
```
GET /fornecedores/1
```

---

### **POST** `/fornecedores` - Criar fornecedor
Cria um novo fornecedor.

**Request Body:**
```json
{
  "razaoSocial": "Frigorífico Rio Grande LTDA",
  "nomeFantasia": "FrigoRG",
  "cnpj": "98.765.432/0001-10",
  "email": "contato@frigorg.com.br",
  "telefone": "(51) 9876-5432",
  "endereco": "Av. dos Fornecedores, 456",
  "cidade": "Porto Alegre",
  "estado": "RS",
  "empresaId": 1
}
```

---

## 📈 **Movimentações de Estoque**

### **POST** `/movimentacoes/entrada` - Registrar entrada
Registra entrada de produtos no estoque.

**Request Body:**
```json
{
  "produtoId": 1,
  "filialId": 1,
  "quantidade": 100,
  "precoUnitario": 25.50,
  "fornecedorId": 1,
  "observacoes": "Lote 001 - Entrega programada"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Entrada registrada com sucesso",
  "data": {
    "id": 1,
    "tipo": "ENTRADA",
    "quantidade": 100,
    "valor": 2550.00,
    "dataHora": "2024-01-20T14:30:00Z",
    "produto": {
      "nome": "Alcatra",
      "codigo": "PROD001"
    }
  }
}
```

---

### **POST** `/movimentacoes/saida` - Registrar saída
Registra saída de produtos do estoque.

**Request Body:**
```json
{
  "produtoId": 1,
  "filialId": 1,
  "quantidade": 50,
  "tipoSaida": "VENDA",
  "observacoes": "Venda balcão - Cliente João"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Saída registrada com sucesso",
  "data": {
    "id": 2,
    "tipo": "SAIDA",
    "quantidade": 50,
    "dataHora": "2024-01-20T15:45:00Z",
    "produto": {
      "nome": "Alcatra",
      "codigo": "PROD001"
    }
  }
}
```

---

### **GET** `/movimentacoes` - Listar movimentações
Lista movimentações de estoque com filtros.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `tipo` (opcional): ENTRADA ou SAIDA
- `dataInicio` (opcional): Data inicial (YYYY-MM-DD)
- `dataFim` (opcional): Data final (YYYY-MM-DD)
- `produtoId` (opcional): Filtro por produto
- `filialId` (opcional): Filtro por filial

**Exemplo:**
```
GET /movimentacoes?tipo=ENTRADA&dataInicio=2024-01-01&dataFim=2024-01-31&page=1&limit=20
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "movimentacoes": [
      {
        "id": 1,
        "tipo": "ENTRADA",
        "quantidade": 100,
        "valor": 2550.00,
        "dataHora": "2024-01-20T14:30:00Z",
        "observacoes": "Lote 001",
        "produto": {
          "id": 1,
          "nome": "Alcatra",
          "codigo": "PROD001"
        },
        "filial": {
          "id": 1,
          "nome": "Filial Centro"
        },
        "fornecedor": {
          "id": 1,
          "nomeFantasia": "FrigoSP"
        }
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "pages": 25
    }
  }
}
```

---

## 🔧 Autenticação para Endpoints Protegidos

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem autenticação.

**Como usar:**
1. Faça login em `/auth/login` e obtenha o token
2. Inclua o token no header de todas as requisições:

```bash
# Exemplo com curl
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     http://localhost:3000/produtos

# Exemplo com JavaScript (fetch)
fetch('http://localhost:3000/produtos', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  }
})
```

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio

# Reset completo do banco
npx prisma migrate reset
```

## 🗄️ Banco de Dados

### Modelos Disponíveis:
- **User** - Usuários do sistema
- **Session** - Sessões de login  
- **Empresa** - Empresas
- **Filial** - Filiais das empresas
- **UserEmpresa** - Relacionamento usuário-empresa
- **Categoria** - Categorias de produtos
- **Produto** - Produtos do estoque
- **Estoque** - Controle de estoque por filial
- **MovimentacaoEstoque** - Histórico de movimentações
- **Fornecedor** - Fornecedores
- **Nota** - Sistema de notas

## 📁 Estrutura do Projeto

```
backend-stockflow/
├── src/
│   ├── @types/           # Tipos TypeScript
│   ├── controllers/      # Controllers da aplicação
│   │   ├── AuthController.ts
│   │   ├── DashboardController.ts
│   │   ├── ProdutoController.ts
│   │   ├── FornecedorController.ts
│   │   └── MovimentacaoController.ts
│   ├── services/         # Serviços (regras de negócio)
│   ├── middlewares/      # Middlewares
│   ├── Errors/          # Classes de erro personalizadas
│   ├── lib/             # Configurações (Prisma)
│   ├── index.ts         # Ponto de entrada
│   ├── server.ts        # Configuração do servidor
│   └── routes.ts        # Rotas centralizadas
├── prisma/
│   ├── migrations/      # Migrações do banco
│   └── schema.prisma    # Schema do banco de dados
└── README.md
```

## 🛡️ Recursos de Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Sistema de sessões com tokens personalizados
- ✅ Middleware de tratamento de erros
- ✅ Validação de dados de entrada
- ✅ Headers de segurança com Helmet
- ✅ Tokens com expiração de 24 horas
- ✅ CORS configurado
- ✅ Rate limiting (em desenvolvimento)

## 🚀 Próximos Passos

- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários
- [ ] Documentação com Swagger
- [ ] Sistema de logs avançado
- [ ] Backup automático do banco
- [ ] Deploy automatizado

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o PostgreSQL está rodando
2. Confirme as variáveis do arquivo `.env`
3. Execute `npx prisma migrate dev` se houver problemas de schema
4. Use `npx prisma studio` para visualizar os dados 