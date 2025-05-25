import connectToDatabase from '../../../../../lib/db';
import HabilidadeModel from '../../../../../models/responsabilidade/Habilidade';

const { Habilidade } = HabilidadeModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const habilidades = await Habilidade.find().sort({ area: 1, item: 1, funcao: 1,});

      res.status(200).json({ habilidades });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar habilidades', error);
    res.status(500).json({ error: 'Erro ao buscar habilidades' });
  }
};
