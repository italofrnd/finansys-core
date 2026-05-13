/**
 * Rotas da API - FinanSys Core
 * 
 * Define os endpoints públicos e privados do sistema.
 * 
 * @module routes/financeiro
 * @requires express
 * @requires ../middlewares/auth
 */

const express = require('express');
const router = express.Router();

// Importa os controllers
const login = require('../controllers/loginController');
const contasReceber = require('../controllers/contasReceberController');
const contasPagar = require('../controllers/contasPagarController');
const fluxoCaixa = require('../controllers/fluxoCaixaController');

// Importa o middleware de autenticação
const { autenticarToken } = require('../middlewares/auth');

// 
// 1. ROTA PÚBLICA (NÃO EXIGE TOKEN)


/**
 * POST /api/login
 * 
 * Autentica o usuário e retorna um token JWT.
 * Não requer autenticação prévia.
 */
router.post('/login', login.login);


// 2. ROTAS PROTEGIDAS (EXIGEM TOKEN JWT)


/**
 * GET /api/contas-receber
 * 
 * Lista todas as contas a receber.
 * Requer token válido no header Authorization.
 */
router.get('/contas-receber', autenticarToken, contasReceber.getAll);

/**
 * GET /api/contas-pagar
 * 
 * Lista todas as contas a pagar.
 * Requer token válido no header Authorization.
 */
router.get('/contas-pagar', autenticarToken, contasPagar.getAll);

/**
 * GET /api/fluxo-caixa
 * 
 * Retorna o fluxo de caixa (entradas e saídas).
 * Requer token válido no header Authorization.
 */
router.get('/fluxo-caixa', autenticarToken, fluxoCaixa.getFluxo);

/**
 * GET /api/dre
 * 
 * Retorna a Demonstração de Resultado (DRE).
 * Requer token válido no header Authorization.
 */
router.get('/dre', autenticarToken, fluxoCaixa.getDRE);
const registroController = require('../controllers/registroController');

// Rota pública de registro (cadastro de novos usuários)
router.post('/registrar', registroController.registrar);

// Rotas de Contas a Receber (CRUD completo)
router.get('/contas-receber', autenticarToken, contasReceber.getAll);
router.post('/contas-receber', autenticarToken, contasReceber.create);
router.put('/contas-receber/:id', autenticarToken, contasReceber.update);
router.delete('/contas-receber/:id', autenticarToken, contasReceber.remove);



// 3. EXPORTAÇÃO DO ROUTER


module.exports = router;