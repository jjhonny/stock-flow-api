# Sistema de Controle de Estoque Simples

Sistema simples e direto para controle de estoque baseado em notas de entrada e saída.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** para API REST
- **Prisma ORM** para banco de dados
- **PostgreSQL** como banco de dados
- **bcryptjs** para criptografia de senhas

## 📋 Funcionalidades

### Autenticação
- ✅ Registro de usuários
- ✅ Login com token de sessão
- ✅ Visualização de perfil
- ✅ Edição de perfil

### Dashboard
- ✅ Estatísticas gerais do sistema
- ✅ Produtos com baixo estoque
- ✅ Produtos mais movimentados
- ✅ Notas recentes
- ✅ Valor total em estoque

### Notas de Movimentação
- ✅ Criação de notas de entrada (com produtos)
- ✅ Criação de notas de saída (produtos já cadastrados)
- ✅ Listagem de notas com filtros
- ✅ Visualização detalhada de notas
- ✅ Saída parcial de produtos de uma nota

## 🗄️ Estrutura do Banco

### Tabelas Principais:
- **users** - Usuários do sistema
- **sessions** - Sessões de login
- **produtos** - Produtos com estoque integrado
- **notas_movimentacao** - Notas de entrada e saída
- **itens_nota_movimentacao** - Itens das notas

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repo>
cd backend-stockflow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure sua DATABASE_URL no arquivo .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/stockflow"
```

4. **Execute as migrations**
```bash
npx prisma migrate dev
```

5. **Inicie o servidor**
```bash
npm run dev
```

## 📡 Endpoints da API

### 🔐 Autenticação (/auth)

#### POST /auth/register
Registrar novo usuário
```json
{
  "email": "usuario@email.com",
  "senhaLogin": "123456"
}
```

#### POST /auth/login
Login do usuário
```json
{
  "email": "usuario@email.com",
  "senhaLogin": "123456"
}
```

#### GET /auth/me
Obter dados do usuário atual
```
Header: Authorization: Bearer <token>
```

#### PUT /auth/profile
Editar perfil do usuário
```json
{
  "name": "Nome do Usuário",
  "email": "novo@email.com"
}
```

### 📊 Dashboard (/dashboard)

#### GET /dashboard/stats
Estatísticas gerais do sistema
```
Header: Authorization: Bearer <token>
```

### 📝 Notas (/notas)

#### POST /notas/entrada
Criar nota de entrada (produtos podem ser criados automaticamente)
```json
{
  "numero": "ENT001",
  "observacoes": "Compra de produtos",
  "motivo": "COMPRA",
  "destinatario": "Estoque principal",
  "produtos": [
    {
      "codigo": "PROD001",
      "nome": "Notebook Dell",
      "descricao": "Notebook Dell Inspiron 15",
      "unidade": "UN",
      "preco": 2500.00,
      "quantidade": 5
    }
  ]
}
```

#### POST /notas/saida
Criar nota de saída (produtos devem existir)
```json
{
  "numero": "SAI001",
  "observacoes": "Venda para cliente",
  "motivo": "VENDA",
  "destinatario": "Cliente XYZ",
  "produtos": [
    {
      "codigo": "PROD001",
      "quantidade": 2
    }
  ]
}
```

#### GET /notas
Listar notas com paginação e filtros
```
Query params:
- page=1 (página)
- limit=10 (itens por página)
- tipo=ENTRADA ou SAIDA (filtro por tipo)
- numero=ENT001 (filtro por número)
```

#### GET /notas/:id
Buscar nota específica por ID

#### POST /notas/:id/saida-parcial
Realizar saída parcial de produtos de uma nota
```json
{
  "numeroNotaSaida": "SAI002",
  "observacoes": "Saída parcial",
  "produtos": [
    {
      "codigo": "PROD001",
      "quantidade": 1
    }
  ]
}
```

## 🔒 Autenticação

Todas as rotas (exceto register e login) exigem token de autorização:
```
Authorization: Bearer <token_retornado_no_login>
```

## 💾 Controle de Estoque

- **Entrada**: Adiciona produtos ao estoque (cria produtos se não existirem)
- **Saída**: Remove produtos do estoque (verifica disponibilidade)
- **Estoque**: Controlado automaticamente no campo `quantidade` da tabela `produtos`

## 🧪 Testando a API

### Exemplo completo de uso:

1. **Registrar usuário**
```bash
POST /auth/register
{
  "email": "admin@teste.com",
  "senhaLogin": "123456"
}
```

2. **Fazer login**
```bash
POST /auth/login
{
  "email": "admin@teste.com",
  "senhaLogin": "123456"
}
```

3. **Criar nota de entrada**
```bash
POST /notas/entrada
Authorization: Bearer <token>
{
  "numero": "ENT001",
  "produtos": [
    {
      "codigo": "NOTE001",
      "nome": "Notebook Dell",
      "preco": 2500.00,
      "quantidade": 10
    }
  ]
}
```

4. **Ver dashboard**
```bash
GET /dashboard/stats
Authorization: Bearer <token>
```

## 🛠️ Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Compilar TypeScript
npm run build

# Rodar em produção
npm start

# Reset do banco de dados
npx prisma migrate reset

# Visualizar banco de dados
npx prisma studio
```

## 📝 Notas Importantes

- O sistema é simples e direto, focado apenas no essencial
- Produtos são criados automaticamente nas notas de entrada
- Controle de estoque integrado aos produtos
- Sessões com expiração de 24 horas
- Todas as operações exigem autenticação (exceto registro/login)
