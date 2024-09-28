import * as SQLite from 'expo-sqlite';

let db;

// Função para abrir o banco de dados
export const openDatabaseAsync = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('mydatabase.db');
  }
  return db; // Retorne o banco de dados
};

// Função para inicializar o banco de dados e as tabelas
export const initDatabaseWithTables = async () => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(30) NOT NULL,
      email VARCHAR(30) NOT NULL UNIQUE,
      senha VARCHAR(20) NOT NULL,
      turma VARCHAR(10) NOT NULL,
      imageUrl TEXT NULL
    );
  `);
};

// Função para cadastrar um usuário
export const registerUser = async (nome, email, senha, turma) => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }
  return await db.runAsync('INSERT INTO users (nome, email, senha, turma) VALUES (?, ?, ?, ?);', [nome, email, senha, turma]);
};

// Função para realizar o login de um usuário
export const loginUser = async (email, senha) => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  const result = await db.getFirstAsync('SELECT * FROM users WHERE email = ? AND senha = ?;', [email, senha]);
  if (result) {
    return result;
  } else {
    throw new Error('Credenciais inválidas');
  }
};

// Função para obter um usuário pelo email
export const getUserByEmail = async (email) => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  return await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
};

// Função para atualizar a imagem do usuário
export const updateUserImage = async (email, imageUrl) => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  await db.runAsync(`UPDATE users SET imageUrl = ? WHERE email = ?;`, [imageUrl, email]); // Mude para runAsync
};
