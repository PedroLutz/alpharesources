// pages/api/create.js
import connectToDatabase from '../../lib/db';
import Lancamento from '../../models/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { tipo, descricao, valor, data, area, origem, destino } = req.body;

      const valorAjustado = tipo === 'Despesa' ? -1 * valor : valor;

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

      res.status(201).json({ message: 'Pessoa criada com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao criar a pessoa', error);
    res.status(500).json({ error: 'Erro ao criar a pessoa' });
  }
};
