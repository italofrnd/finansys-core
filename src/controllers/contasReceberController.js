/**
 * Controller de Contas a Receber
 * 
 * Gerencia as operações CRUD para contas a receber.
 * 
 * @module controllers/contasReceberController
 * @requires ../config/db
 */

const db = require('../config/db');

/**
 * Lista todas as contas a receber que ainda não foram recebidas
 * 
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @returns {Promise<void>}
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        id AS nu_registro,
        cliente AS no_cliente_cartao,
        documento AS de_documento,
        valor AS vr_areceber,
        data_cadastro AS dt_cadastro,
        data_prevista AS dt_prevista
      FROM contas_receber 
      WHERE data_recebimento IS NULL
      ORDER BY data_prevista ASC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar contas a receber:', error);
    res.status(500).json({ error: 'Erro ao buscar contas a receber' });
  }
};

/**
 * Cria uma nova conta a receber
 * 
 * @param {Object} req - Requisição Express (body: documento, cliente, valor, data_cadastro, data_prevista, observacao)
 * @param {Object} res - Resposta Express
 */
exports.create = async (req, res) => {
  const { documento, cliente, valor, data_cadastro, data_prevista, observacao } = req.body;

  if (!documento || !cliente || !valor || !data_prevista) {
    return res.status(400).json({ error: 'Documento, cliente, valor e data prevista são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO contas_receber 
        (documento, cliente, valor, data_cadastro, data_prevista, observacao)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6)
       RETURNING id`,
      [documento, cliente, valor, data_cadastro || null, data_prevista, observacao || null]
    );

    res.status(201).json({
      sucesso: true,
      id: result.rows[0].id,
      message: 'Conta a receber criada com sucesso.'
    });
  } catch (error) {
    console.error(' Erro ao criar conta a receber:', error);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
};

/**
 * Atualiza uma conta a receber existente
 * 
 * @param {Object} req - Requisição Express (params.id + body campos)
 * @param {Object} res - Resposta Express
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { documento, cliente, valor, data_cadastro, data_prevista, data_recebimento, observacao } = req.body;

  if (!documento || !cliente || !valor || !data_prevista) {
    return res.status(400).json({ error: 'Documento, cliente, valor e data prevista são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `UPDATE contas_receber 
       SET documento = $1, 
           cliente = $2, 
           valor = $3, 
           data_cadastro = $4, 
           data_prevista = $5, 
           data_recebimento = $6, 
           observacao = $7
       WHERE id = $8
       RETURNING id`,
      [documento, cliente, valor, data_cadastro || null, data_prevista, data_recebimento || null, observacao || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada.' });
    }

    res.json({
      sucesso: true,
      message: 'Conta a receber atualizada com sucesso.'
    });
  } catch (error) {
    console.error(' Erro ao atualizar conta a receber:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar conta.' });
  }
};

/**
 * Exclui uma conta a receber
 * 
 * @param {Object} req - Requisição Express (params.id)
 * @param {Object} res - Resposta Express
 */
exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM contas_receber WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta a receber não encontrada.' });
    }

    res.json({
      sucesso: true,
      message: 'Conta a receber excluída com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao excluir conta a receber:', error);
    res.status(500).json({ error: 'Erro interno ao excluir conta.' });
  }
};
