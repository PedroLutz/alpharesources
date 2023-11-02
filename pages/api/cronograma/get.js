// pages/api/wbs/get.js
import connectToDatabase from '../../../lib/db';
import Gantt from '../../../models/Gantt';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const cronogramas = await Gantt.find();

      res.status(200).json({ cronogramas });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar elementos da WBS', error);
    res.status(500).json({ error: 'Erro ao buscar elementos da WBS' });
  }
};
