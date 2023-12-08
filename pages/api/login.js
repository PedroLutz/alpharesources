// pages/api/wbs/get.js
import connectToDatabase from '../../lib/db';
import Elemento from '../../models/User';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const usuario = await Elemento.find();

      res.status(200).json({ usuario });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos da WBS', error);
    res.status(500).json({ error: 'Erro ao buscar elementos da WBS' });
  }
};
