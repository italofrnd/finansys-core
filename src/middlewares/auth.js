/**
 * Middleware de Autenticação JWT
 * 
 * Verifica se o token enviado no header Authorization é válido.
 * 
 * @module middlewares/auth
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar rotas privadas
 * 
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 * 
 * @returns {void}
 */
function autenticarToken(req, res, next) {
  // Extrai o token do header Authorization (formato: "Bearer TOKEN")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Caso 1: Token não foi enviado
  if (!token) {
    return res.status(401).json({ 
      error: 'Acesso negado. Token não fornecido.' 
    });
  }

  // Caso 2: Verifica se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido ou expirado. Faça login novamente.' 
      });
    }
    
    // Adiciona os dados do usuário na requisição (para uso nos controllers)
    req.usuario = usuario;
    next();
  });
}

module.exports = { autenticarToken };
