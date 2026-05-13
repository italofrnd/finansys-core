const { connect } = require('../config/db');

exports.getAll = (req, res) => {
  connect((err, db) => {
    if (err) {
      console.error('Erro ao conectar:', err.message);
      return res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
    }

    const query = `
      SELECT
        NU_REGISTRO,
        CO_DOCUMENTO,
        DE_DOCUMENTO,
        NO_CLIENTE_CARTAO,
        VR_ARECEBER,
        DT_CADASTRO,
        DT_PREVISTA,
        DT_RECEBIMENTO
      FROM SISTB020_CONTA_RECEBER
      ROWS 50
    `;

    db.query(query, (err, result) => {
      if (err) {
        console.error('Erro na consulta:', err.message);
        res.status(500).json({ error: 'Erro na consulta' });
      } else {
        res.json(result);
      }
      db.detach();
    });
  });
};

exports.getById = (req, res) => {
  const { id } = req.params;

  connect((err, db) => {
    if (err) {
      console.error('Erro ao conectar:', err.message);
      return res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
    }

    const query = `
      SELECT
        NU_REGISTRO,
        CO_DOCUMENTO,
        DE_DOCUMENTO,
        NO_CLIENTE_CARTAO,
        VR_ARECEBER,
        DT_CADASTRO,
        DT_PREVISTA,
        DT_RECEBIMENTO
      FROM SISTB020_CONTA_RECEBER
      WHERE NU_REGISTRO = ?
    `;

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Erro na consulta:', err.message);
        res.status(500).json({ error: 'Erro na consulta' });
      } else if (!result.length) {
        res.status(404).json({ error: 'Registro não encontrado' });
      } else {
        res.json(result[0]);
      }
      db.detach();
    });
  });
};
