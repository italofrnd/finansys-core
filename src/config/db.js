/**
 * Módulo de conexão com o PostgreSQL
 * 
 * Gerencia o pool de conexões e fornece funções seguras para queries.
 * 
 * @module config/db
 * @requires pg
 * @requires dotenv
 */

const { Pool } = require('pg');
require('dotenv').config();


// 1. CONFIGURAÇÃO DO POOL DE CONEXÕES


/**
 * Pool de conexões com o PostgreSQL
 * 
 * Configurações baseadas nas variáveis de ambiente (.env)
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                      // Máximo de conexões simultâneas
  idleTimeoutMillis: 30000,     // Tempo que uma conexão fica ociosa (30s)
  connectionTimeoutMillis: 2000, // Timeout para conectar (2s)
});


// 2. EVENTOS DE LOG 


pool.on('connect', () => {
  console.log('Nova conexão estabelecida com o PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err.message);
});


// 3. FUNÇÕES PRINCIPAIS


/**
 * Executa uma query SQL no banco de dados
 * 
 * @param {string} text - Query SQL (pode conter placeholders $1, $2, ...)
 * @param {Array} params - Valores para os placeholders
 * @returns {Promise<Object>} - Resultado da query (contém rows, rowCount, etc.)
 * 
 * @example
 * const result = await query('SELECT * FROM usuarios WHERE id = $1', [1]);
 * console.log(result.rows[0]);
 */
async function query(text, params = []) {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log apenas em desenvolvimento (não polui produção)
    if (process.env.NODE_ENV !== 'production') {
      console.log(` Query executada em ${duration}ms | Linhas: ${result.rowCount}`);
    }
    
    return result;
  } catch (error) {
    // TRATAMENTO ESPECÍFICO PARA ERRO DE UNICIDADE (código 23505)
    if (error.code === '23505') {
      // Não loga como erro, apenas como aviso (sem poluir o console)
      console.warn(`Violação de unicidade: ${error.constraint || 'chave duplicada'}`);
      throw error; // Ainda lança o erro para o controller tratar
    }
    
    // Outros erros são logados normalmente
    console.error(' Erro na query:', {
      message: error.message,
      query: text,
      params
    });
    throw error;
  }
}

/**
 * Obtém um cliente do pool para operações com transação
 * 
 * 
 * @returns {Promise<Object>} - Cliente do pool
 * 
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO ...');
 *   await client.query('COMMIT');
 * } catch {
 *   await client.query('ROLLBACK');
 *   throw error;
 * } finally {
 *   client.release();
 * }
 */
async function getClient() {
  return await pool.connect();
}

/**
 * Testa a conexão com o banco de dados
 * 
 * 
 * @returns {Promise<boolean>} - true se conectou
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as hora_servidor');
    const hora = result.rows[0].hora_servidor;
    console.log(` PostgreSQL conectado! Hora do servidor: ${hora}`);
    return true;
  } catch (err) {
    console.error(' Falha na conexão com PostgreSQL:', err.message);
    return false;
  }
}


// 4. EXPORTAÇÃO DO MÓDULO


module.exports = {
  query,
  getClient,
  testConnection,
  pool, // Exposto apenas para casos extremos
};