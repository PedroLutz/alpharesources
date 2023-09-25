// pages/api/get.js
import connectToDatabase from '../../lib/db';
import Lancamento from '../../models/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const lancamentos = await Lancamento.find();

      res.status(200).json(lancamentos);
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar pessoas', error);
    res.status(500).json({ error: 'Erro ao buscar pessoas' });
  }
};