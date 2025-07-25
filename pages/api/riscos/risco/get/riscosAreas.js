import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import RiscoModel from '../../../../../models/riscos/Risco';

const { Risco } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const riscos = await Risco.find({}, 'risco area ehNegativo');

      res.status(200).json({ riscos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Riscos', error);
    res.status(500).json({ error: 'Erro ao buscar os Riscos' });
  }
};