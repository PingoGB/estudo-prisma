import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import cors from "cors";


const app = express();
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json());

//rota raiz
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Rota para Listar Usuários
app.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

// Rota pra buscar usuário por ID
app.get('/users/:id', async (req, res) => {
  const {id} = req.params;
  try{
    const getUser = await prisma.user.findUnique({
      where: {id: Number(req.params.id)}
    })
    res.json(getUser);
  } catch (error) {
    res.status(404).json({ error: "Usuário não encontrado." });
  }
})

//rota pra listar todos os posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar posts." });
  }
});

//rota pra atualizar título, conteúdo ou tag
app.put('/posts/:id', async (req, res)=> {
  const { title, content, tag } = req.body;
  try {
    const updatePost = await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { title, content, tag }
    });
    res.json(updatePost);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar o post." });
  }
}
)


// 👤 Rota para Criar Usuário
app.post('/users', async (req, res) => {
    const { name, email, cpf } = req.body;
    try {
      const newUser = await prisma.user.create({
        data: { name, email, cpf }
      });
      res.status(201).json(newUser);
    } catch (error: any) {
      // 🔍 Isso vai enviar o erro real do Prisma/Banco para o seu Postman!
      res.status(400).json({ 
        error: "Erro ao criar usuário.", 
        details: error.message 
      });
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

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await prisma.user.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Usuário deletado com sucesso!", deleteUser });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar o usuário." });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});