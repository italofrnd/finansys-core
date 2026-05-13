/**
 * Servidor Principal - FinanSys Core
 * 
 * Configuração do servidor Express, middlewares e rotas.
 * 
 * @module main
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires ./routes/financeiro
 * @requires ./config/db
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas e conexão com banco
const financeiroRoutes = require('./routes/financeiro');
const { testConnection } = require('./config/db');

// ============================================
// 1. CONFIGURAÇÕES INICIAIS
// ============================================

const app = express();
const PORT = process.env.PORT || 3333;

// ============================================
// 2. MIDDLEWARES GLOBAIS
// ============================================

app.use(cors());              // Permite requisições de origens diferentes
app.use(express.json());      // Parse de JSON no body das requisições

// ============================================
// 3. TESTE DE CONEXÃO COM O BANCO (opcional)
// ============================================

// Verifica se o PostgreSQL está acessível ao iniciar
testConnection();

// ============================================
// 4. ROTAS
// ============================================

/**
 * Rota pública de login - NÃO usa middleware de autenticação
 * A autenticação está dentro do loginController
 */
app.use('/api', financeiroRoutes);

// ============================================
// 5. TRATAMENTO DE ERROS (fallback)
// ============================================

/**
 * Middleware de erro global - captura qualquer erro não tratado
 */
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno no servidor. Tente novamente mais tarde.' 
  });
});

// ============================================
// 6. INICIALIZAÇÃO DO SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
  ============================================
  FinanSys Core - Servidor iniciado!
  ============================================
  Porta: ${PORT}
  JWT Secret: ${process.env.JWT_SECRET ? 'Configurado' : 'FALTANDO!'}
  API Base: http://localhost:${PORT}/api
  ============================================
  `);
});