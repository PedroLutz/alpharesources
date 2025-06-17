import connectToDatabase from '../../../../lib/db';
import RaciModel from '../../../../models/responsabilidade/Raci';

const { Raci } = RaciModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const itensRaci = await Raci.find().sort({ area: 1 });
  
        res.status(200).json({ itensRaci });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar membros', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
};
