// pages/api/get.js
import connectToDatabase from '../../lib/db';
import Lancamento from '../../models/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const lancamentos = await Lancamento.find();

      // Consulta para obter a soma de todos os valores
      const somaValores = await Lancamento.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);

      // Consulta para obter os valores agrupados por área
      const valoresPorArea = await Lancamento.aggregate([
        {
          $group: {
            _id: '$area',
            total: { $sum: '$valor' }
          }
        }
      ]);

      res.status(200).json({ lancamentos, somaValores, valoresPorArea });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar lançamentos', error);
    res.status(500).json({ error: 'Erro ao buscar lançamentos' });
  }
};
