// pages/api/get.js
import connectToDatabase from '../../../../lib/db';
import Membro from '../../../../models/responsabilidade/Membro';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const membros = await Membro.find();
      
      const nomes = await Membro.find().select('nome');

      res.status(200).json({ membros , nomes});
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar membros', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
};
