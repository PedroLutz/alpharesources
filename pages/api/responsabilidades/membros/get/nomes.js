import connectToDatabase from '../../../../../lib/db';
import MembroModel from '../../../../../models/responsabilidade/Membro';

const { Membro } = MembroModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const nomes = await Membro.find().select('nome');

      res.status(200).json({ nomes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar membros', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
};
