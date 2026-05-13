const db = require('../config/db');

/**
 * Lista todas as contas a pagar 
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, documento, valor, data_prevista, data_pagamento, observacao 
       FROM contas_pagar 
       WHERE data_pagamento IS NULL
       ORDER BY data_prevista ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
};

/**
 * Cria uma nova conta a pagar
 */
exports.create = async (req, res) => {
  const { documento, valor, data_prevista, observacao } = req.body;

  if (!documento || !valor || !data_prevista) {
    return res.status(400).json({ error: 'Documento, valor e data prevista são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO contas_pagar (documento, valor, data_prevista, observacao)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [documento, valor, data_prevista, observacao || null]
    );

    res.status(201).json({
      sucesso: true,
      id: result.rows[0].id,
      message: 'Conta a pagar criada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
};

/**
 * Atualiza uma conta a pagar existente
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { documento, valor, data_prevista, observacao, data_pagamento } = req.body;

  if (!documento || !valor || !data_prevista) {
    return res.status(400).json({ error: 'Documento, valor e data prevista são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `UPDATE contas_pagar 
       SET documento = $1, valor = $2, data_prevista = $3, observacao = $4, data_pagamento = $5
       WHERE id = $6
       RETURNING id`,
      [documento, valor, data_prevista, observacao || null, data_pagamento || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada.' });
    }

    res.json({
      sucesso: true,
      message: 'Conta a pagar atualizada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar conta.' });
  }
};

/**
 * Exclui uma conta a pagar
 */
exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM contas_pagar WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a pagar não encontrada.' });
    }

    res.json({
      sucesso: true,
      message: 'Conta a pagar excluída com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao excluir conta a pagar:', error);
    res.status(500).json({ error: 'Erro interno ao excluir conta.' });
  }
};