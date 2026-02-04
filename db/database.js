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
      tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'aluno',
      imageUrl TEXT NULL
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma VARCHAR(10) NOT NULL,
      time VARCHAR(20) NOT NULL,
      monday VARCHAR(50),
      tuesday VARCHAR(50),
      wednesday VARCHAR(50),
      thursday VARCHAR(50),
      friday VARCHAR(50)
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma VARCHAR(10) NOT NULL,
      title VARCHAR(100) NOT NULL,
      date VARCHAR(20) NOT NULL
    );
  `);
};

// Função para cadastrar um usuário
export const registerUser = async (nome, email, senha, turma, tipo_usuario = 'aluno') => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }
  return await db.runAsync('INSERT INTO users (nome, email, senha, turma, tipo_usuario) VALUES (?, ?, ?, ?, ?);', [nome, email, senha, turma, tipo_usuario]);
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

export const updateUserDetails = async (id, nome, email) => {
  const db = await openDatabaseAsync();

  // Verifica se o novo email já existe para outro usuário
  const existingEmailUser = await db.getFirstAsync(
    'SELECT * FROM users WHERE email = ? AND id != ?;',
    [email, id]
  );

  if (existingEmailUser) {
    // Lança um erro específico para email duplicado
    throw new Error('Email já cadastrado por outro usuário');
  }

  try {
    // Atualiza o nome e email do usuário
    const result = await db.runAsync(
      `UPDATE users SET nome = ?, email = ? WHERE id = ?;`,
      [nome, email, id]
    );

    if (result.rowsAffected === 0) {
      // Caso nenhuma linha tenha sido atualizada
      throw new Error('Nenhuma linha foi atualizada. Verifique se o ID está correto.');
    }
  } catch (error) {
    // Lança um erro geral caso ocorra algo fora do esperado
    throw new Error('Erro ao atualizar os detalhes do usuário');
  }
};

// Função para alterar a senha do usuário
export const updatePassword = async (email, oldPassword, newPassword) => {
  const db = await openDatabaseAsync(); // Chame o banco de dados
  // Verifique se a senha antiga está correta
  const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
  
  if (user && user.senha === oldPassword) {
    // Atualize a senha se a antiga estiver correta
    await db.runAsync('UPDATE users SET senha = ? WHERE email = ?;', [newPassword, email]);
  } else {
    throw new Error('Senha antiga incorreta');
  }
};

// Funções para Grade Horária
export const getScheduleByTurma = async (turma) => {
  const db = await openDatabaseAsync();
  const result = await db.getAllAsync(
    'SELECT * FROM schedules WHERE turma = ? ORDER BY CAST(substr(time, 1, instr(time, " ") - 1) AS FLOAT);',
    [turma]
  );
  return result;
};

export const addSchedule = async (turma, time, monday, tuesday, wednesday, thursday, friday) => {
  const db = await openDatabaseAsync();
  return await db.runAsync(
    'INSERT INTO schedules (turma, time, monday, tuesday, wednesday, thursday, friday) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [turma, time, monday, tuesday, wednesday, thursday, friday]
  );
};

export const updateSchedule = async (id, turma, time, monday, tuesday, wednesday, thursday, friday) => {
  const db = await openDatabaseAsync();
  return await db.runAsync(
    'UPDATE schedules SET turma = ?, time = ?, monday = ?, tuesday = ?, wednesday = ?, thursday = ?, friday = ? WHERE id = ?;',
    [turma, time, monday, tuesday, wednesday, thursday, friday, id]
  );
};

// Funções para Eventos
export const getEventsByTurma = async (turma) => {
  const db = await openDatabaseAsync();
  return await db.getAllAsync(
    'SELECT * FROM events WHERE turma = ? ORDER BY date;',
    [turma]
  );
};

export const addEvent = async (turma, title, date) => {
  const db = await openDatabaseAsync();
  return await db.runAsync(
    'INSERT INTO events (turma, title, date) VALUES (?, ?, ?);',
    [turma, title, date]
  );
};

export const deleteEvent = async (id) => {
  const db = await openDatabaseAsync();
  return await db.runAsync('DELETE FROM events WHERE id = ?;', [id]);
};

// Função para popular o banco com dados iniciais
export const populateInitialData = async () => {
  const db = await openDatabaseAsync();
  
  // Verifica se já existe dados
  const count = await db.getFirstAsync('SELECT COUNT(*) as total FROM schedules;');
  
  if (count.total === 0) {
    // Dados para Turma A
    const turmaASchedule = [
      ['Turma A', '7:00 - 7:50', 'Ing', 'Hist', 'Mat', 'Geo', 'Edu'],
      ['Turma A', '7:50 - 8:40', 'Hist', 'Port', 'Mat', 'Cien', 'Mat'],
      ['Turma A', '8:40 - 9:30', 'Mat', 'Mat', 'Edu', 'Hist', 'Port'],
      ['Turma A', '9:30 - 9:50', 'Intervalo', 'Intervalo', 'Intervalo', 'Intervalo', 'Intervalo'],
      ['Turma A', '9:50 - 10:40', 'Port', 'Hist', 'Geo', 'Mat', 'Edu'],
      ['Turma A', '10:40 - 11:30', 'Cien', 'Ing', 'Hist', 'Port', 'Mat'],
      ['Turma A', '11:30 - 12:20', 'Edu', 'Geo', 'Mat', 'Hist', 'Port'],
    ];

    // Dados para Turma B
    const turmaBSchedule = [
      ['Turma B', '7:00 - 7:50', 'Mat', 'Geo', 'Hist', 'Edu', 'Cien'],
      ['Turma B', '7:50 - 8:40', 'Física', 'Química', 'Mat', 'Port', 'Hist'],
      ['Turma B', '8:40 - 9:30', 'Ing', 'Mat', 'Geo', 'Hist', 'Edu'],
      ['Turma B', '9:30 - 9:50', 'Inter', 'Inter', 'Inter', 'Inter', 'Inter'],
      ['Turma B', '9:50 - 10:40', 'Mat', 'Hist', 'Port', 'Edu', 'Cien'],
      ['Turma B', '10:40 - 11:30', 'Edu', 'Mat', 'Física', 'Geo', 'Hist'],
      ['Turma B', '11:30 - 12:20', 'Hist', 'Física', 'Mat', 'Port', 'Edu'],
    ];

    // Dados para Turma C
    const turmaCSchedule = [
      ['Turma C', '7:00 - 7:50', 'Geo', 'Cien', 'Mat', 'Hist', 'Edu'],
      ['Turma C', '7:50 - 8:40', 'Port', 'Mat', 'Física', 'Química', 'Geo'],
      ['Turma C', '8:40 - 9:30', 'Hist', 'Edu', 'Mat', 'Ing', 'Port'],
      ['Turma C', '9:30 - 9:50', 'Inter', 'Inter', 'Inter', 'Inter', 'Inter'],
      ['Turma C', '9:50 - 10:40', 'Edu', 'Mat', 'Geo', 'Hist', 'Cien'],
      ['Turma C', '10:40 - 11:30', 'Mat', 'Física', 'Edu', 'Port', 'Hist'],
      ['Turma C', '11:30 - 12:20', 'Física', 'Geo', 'Mat', 'Edu', 'Hist'],
    ];

    // Inserir horários
    const allSchedules = [...turmaASchedule, ...turmaBSchedule, ...turmaCSchedule];
    for (const schedule of allSchedules) {
      await db.runAsync(
        'INSERT INTO schedules (turma, time, monday, tuesday, wednesday, thursday, friday) VALUES (?, ?, ?, ?, ?, ?, ?);',
        schedule
      );
    }

    // Inserir eventos
    const events = [
      ['Turma A', 'Feira de Ciências', '2024-10-10'],
      ['Turma A', 'Gincana Escolar', '2024-11-05'],
      ['Turma B', 'Festival de Artes', '2024-09-30'],
      ['Turma B', 'Passeio Escolar', '2024-12-02'],
      ['Turma C', 'Festival de Artes', '2024-09-30'],
      ['Turma C', 'Passeio Escolar', '2024-12-02'],
    ];

    for (const event of events) {
      await db.runAsync(
        'INSERT INTO events (turma, title, date) VALUES (?, ?, ?);',
        event
      );
    }
  }
};
