// pages/api/get.js
import connectToDatabase from '../../../../lib/db';
import Raci from '../../../../models/responsabilidade/Raci';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const itensRaci = await Raci.find();
      itensRaci.sort((a, b) => (a.area > b.area) ? 1 : -1);

      res.status(200).json({ itensRaci });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar membros', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
};
