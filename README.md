# meu-prisma

API REST em Node.js com Express, TypeScript e Prisma ORM conectada a um banco PostgreSQL. O projeto gerencia **usuários** e **posts**, com relação de um usuário para muitos posts.

## Tecnologias

- **Node.js** + **TypeScript**
- **Express** — servidor HTTP
- **Prisma ORM 7** — acesso ao banco e migrations
- **PostgreSQL** — banco de dados
- **@prisma/adapter-pg** + **pg** — driver exigido pelo Prisma 7 para conexão direta com PostgreSQL
- **tsx** — execução de TypeScript em desenvolvimento

## Estrutura do projeto

```
meu-prisma/
├── server.ts              # Servidor Express e rotas da API
├── prisma/
│   ├── schema.prisma      # Modelos User e Post
│   └── migrations/        # Histórico de migrations
├── prisma.config.ts       # Configuração do Prisma (URL do banco)
├── .env                   # Variáveis de ambiente (não versionar)
├── tsconfig.json
└── package.json
```

## Modelos de dados

| Modelo | Campos principais |
|--------|-------------------|
| **User** | `id`, `name`, `email` (único), `cpf` (único) |
| **Post** | `id`, `title`, `content`, `tag`, `authorId` |

Um usuário pode ter vários posts. Ao excluir um usuário, seus posts são removidos em cascata (`onDelete: Cascade`).

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) rodando localmente (porta padrão: **5432**)

## Instalação

1. Clone o repositório e entre na pasta do projeto:

```bash
cd meu-prisma
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto com a URL do seu banco:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO"
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres"
```

4. Aplique as migrations e gere o Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

## Como rodar

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

O servidor sobe em **http://localhost:3000**.

> **Importante:** não use `node server.ts` diretamente. O Node não executa TypeScript nativamente — use `npm run dev` (tsx) ou compile antes com `tsc`.

## Endpoints da API

### Criar usuário

```http
POST /users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "cpf": "12345678901"
}
```

**Resposta:** `201 Created` com os dados do usuário criado.

---

### Criar post de um usuário

```http
POST /users/:authorId/posts
Content-Type: application/json

{
  "title": "Meu primeiro post",
  "content": "Conteúdo do post...",
  "tag": "tecnologia"
}
```

**Resposta:** `201 Created` com os dados do post.

---

### Listar posts de um usuário

```http
GET /users/:authorId/posts
```

**Resposta:** `200 OK` com array de posts.

---

### Deletar post

```http
DELETE /posts/:id
```

**Resposta:** `200 OK` com mensagem de confirmação e dados do post removido.

## Exemplos com curl

```bash
# Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"João\",\"email\":\"joao@email.com\",\"cpf\":\"12345678901\"}"

# Criar post (substitua 1 pelo id do usuário)
curl -X POST http://localhost:3000/users/1/posts \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Olá\",\"content\":\"Meu post\",\"tag\":\"geral\"}"

# Listar posts do usuário 1
curl http://localhost:3000/users/1/posts

# Deletar post (substitua 1 pelo id do post)
curl -X DELETE http://localhost:3000/posts/1
```

## Comandos úteis do Prisma

| Comando | Descrição |
|---------|-----------|
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma generate` | Gera o Prisma Client após alterar o schema |
| `npx prisma studio` | Abre interface visual para ver/editar dados |
| `npx prisma db pull` | Atualiza o schema a partir do banco existente |

## Observações sobre Prisma 7

Nesta versão, a URL de conexão fica no **`prisma.config.ts`** (para migrations) e no **`.env`** (para a aplicação). O `PrismaClient` **não aceita mais** a opção `datasources` no construtor — é necessário usar um driver adapter:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

## Licença

ISC
