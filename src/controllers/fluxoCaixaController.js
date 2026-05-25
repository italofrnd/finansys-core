/**
 * Controller de Fluxo de Caixa e DRE
 * 
 * Gerencia as operações de fluxo de caixa (entradas/saídas) e DRE (Receita/Despesa).
 * 
 * @module controllers/fluxoCaixaController
 * @requires ../config/db
 */

const db = require('../config/db');

/**
 * Retorna o fluxo de caixa (entradas e saídas agrupadas por data)
 * 
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @returns {Promise<void>}
 */
exports.getFluxo = async (req, res) => {
  try {
    const query = `
      SELECT 
        data_mov, 
        SUM(entrada) AS entrada, 
        SUM(saida) AS saida 
      FROM (
        SELECT 
          data_recebimento AS data_mov, 
          valor AS entrada, 
          0 AS saida
        FROM contas_receber 
        WHERE data_recebimento IS NOT NULL
        
        UNION ALL
        
        SELECT 
          data_pagamento, 
          0, 
          valor
        FROM contas_pagar 
        WHERE data_pagamento IS NOT NULL
      ) AS mov
      GROUP BY data_mov
      ORDER BY data_mov ASC
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(' Erro ao buscar fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro ao consultar fluxo de caixa' });
  }
};

/**
 * Retorna a DRE (Demonstração de Resultado) - Receita e Despesa
 * 
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @returns {Promise<void>}
 */
exports.getDRE = async (req, res) => {
  try {
    const query = `
      SELECT 'Receita' AS tipo, COALESCE(SUM(valor), 0) AS valor 
      FROM contas_receber 
      WHERE data_recebimento IS NOT NULL
      
      UNION ALL
      
      SELECT 'Despesa' AS tipo, COALESCE(SUM(valor), 0) AS valor 
      FROM contas_pagar 
      WHERE data_pagamento IS NOT NULL
    `;

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar DRE:', error);
    res.status(500).json({ error: 'Erro ao consultar DRE' });
  }
};
