const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.registrar = async (req, res) => {
  const { codigo, nome, senha } = req.body;

  if (!codigo || !nome || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await db.query(
      `INSERT INTO operadores (codigo, nome, senha_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (codigo) DO NOTHING 
       RETURNING id, codigo, nome`,
      [codigo, nome, senhaHash]
    );

    if (!result.rows || result.rows.length === 0) {
      // Usuário já existe
      return res.status(409).json({ error: 'Este nome de usuário já está em uso. Escolha outro.' });
    }

    const novoUsuario = result.rows[0];

    res.status(201).json({
      sucesso: true,
      message: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        codigo: novoUsuario.codigo,
        nome: novoUsuario.nome
      }
    });

  } catch (error) {
    // SE O ERRO FOR DE UNICIDADE (23505),
    if (error.code === '23505') {
      console.warn(`⚠️ Usuário já existe (código: ${codigo})`);
      return res.status(409).json({ error: 'Este nome de usuário já está em uso.' });
    }
    
    console.error(' Erro interno no cadastro:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};