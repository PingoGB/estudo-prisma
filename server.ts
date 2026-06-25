import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();

// 🔌 Inicialização correta do Prisma Client com a URL do banco
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

app.use(express.json());

// 👤 Rota para Criar Usuário
app.post('/users', async (req, res) => {
  const { name, email, cpf } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { name, email, cpf }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar usuário." });
  }
});

// 📝 Rota para Criar Post
app.post('/users/:authorId/posts', async (req, res) => {
  const { authorId } = req.params;
  const { title, content, tag } = req.body;
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        tag,
        authorId: Number(authorId)
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar o post." });
  }
});

// 🔍 Rota para Listar Posts de um Usuário
app.get('/users/:authorId/posts', async (req, res) => {
  const { authorId } = req.params;
  try {
    const userPosts = await prisma.post.findMany({
      where: { authorId: Number(authorId) }
    });
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar os posts." });
  }
});

// 🗑️ Rota para Deletar Post
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await prisma.post.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Post deletado com sucesso!", deletedPost });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar o post." });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});