const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { usuario, senha } = req.body;

  // Validação básica
  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  try {
    // Busca o operador pelo código (coluna 'codigo' na tabela operadores)
    const result = await db.query(
      'SELECT id, codigo, nome, senha_hash FROM operadores WHERE codigo = $1',
      [usuario]
    );

    // Usuário não encontrado
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const operador = result.rows[0];

    // Compara a senha fornecida com o hash armazenado no banco
    const senhaValida = await bcrypt.compare(senha, operador.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { 
        id: operador.id, 
        codigo: operador.codigo,
        nome: operador.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Retorna sucesso com token e nome do usuário
    return res.json({
      sucesso: true,
      nome: operador.nome,
      token: token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
