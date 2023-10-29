// pages/api/wbs/get.js
import connectToDatabase from '../../../lib/db';
import Elemento from '../../../models/WorkBS';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const elementos = await Elemento.find().sort({ data: -1 });

      res.status(200).json({ elementos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos da WBS', error);
    res.status(500).json({ error: 'Erro ao buscar elementos da WBS' });
  }
};
