import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import AnaliseModel from '../../../../../models/riscos/Analise';

const { Analise } = AnaliseModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const riscoAnalises = await Analise.find().sort({ risco: 1 });

      res.status(200).json({ riscoAnalises });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Analises', error);
    res.status(500).json({ error: 'Erro ao buscar os Analises' });
  }
};