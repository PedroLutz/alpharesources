// pages/api/create.js
import connectToDatabase from '../../../../lib/db';
import Lancamento from '../../../../models/financeiro/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { tipo, descricao, valor, data, area, origem, destino } = req.body;

      const valorAjustado = tipo === 'Expense' ? -1 * valor : valor;

      // Crie um novo objeto Person com os dados da solicitação
      const newLancamento = new Lancamento({
        tipo,
        descricao,
        valor: valorAjustado,
        data,
        area,
        origem,
        destino,
      });

      // Salve no banco de dados
      await newLancamento.save();

      res.status(201).json({ message: 'Lançamento cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o lançamento', error);
    res.status(500).json({ error: 'Erro ao cadastrar o lançamento' });
  }
};
