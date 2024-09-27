import * as SQLite from 'expo-sqlite';

let db; // Variável do banco de dados

// Função para abrir o banco de dados
export const openDatabaseAsync = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('mydatabase.db'); // Abre o banco de dados
  }
};

// Função para inicializar o banco de dados e as tabelas
export const initDatabaseWithTables = async () => {
  await openDatabaseAsync(); // Abre o banco de dados

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(30) NOT NULL,
      email VARCHAR(30) NOT NULL UNIQUE,
      senha VARCHAR(20) NOT NULL,
      turma VARCHAR(10) NOT NULL
    );
  `);

};

// Função para cadastrar um usuário
export const registerUser = async (nome, email, senha, turma) => {
  await openDatabaseAsync(); // Garante que o banco de dados está aberto

  // Verifica se o email já existe
  const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
  
  if (existingUser) {
    throw new Error('Email já cadastrado'); // Lança erro se o email já existir
  }

  // Se o email não existir, insira o novo usuário
  return await db.runAsync('INSERT INTO users (nome, email, senha, turma) VALUES (?, ?, ?, ?);', [nome, email, senha, turma]);
};

// Função para realizar o login de um usuário
export const loginUser = async (email, senha) => {
  await openDatabaseAsync(); // Garante que o banco de dados está aberto
  const result = await db.getFirstAsync(
    'SELECT * FROM users WHERE email = ? AND senha = ?;', 
    [email, senha]
  );

  if (result) {
    return result; // Retorna os dados do usuário
  } else {
    throw new Error('Credenciais inválidas'); // Lida com falha de login
  }
};

// Função para obter um usuário pelo email
export const getUserByEmail = async (email) => {
  await openDatabaseAsync(); // Garante que o banco de dados está aberto
  const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
  return user; // Retorna o usuário encontrado ou undefined
};
