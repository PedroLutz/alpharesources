// pages/api/get.js
import connectToDatabase from '../../../lib/db';
import Plano from '../../../models/Plano';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const planos = await Plano.find();
    
      res.status(200).json({ planos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar planos', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
};
