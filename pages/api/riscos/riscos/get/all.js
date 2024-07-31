import connectToDatabase from '../../../../../lib/db';
import RiscoModel from '../../../../../models/riscos/Risco';

const { Risco } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const riscos = await Risco.find().sort({ area: 1 });
  
        res.status(200).json({ riscos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Riscos', error);
    res.status(500).json({ error: 'Erro ao buscar os Riscos' });
  }
};
