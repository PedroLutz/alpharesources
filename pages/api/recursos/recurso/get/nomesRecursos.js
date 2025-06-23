import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import RecursoModel from '../../../../../models/recursos/Recurso';

const { Recurso } = RecursoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const recursos = await Recurso.find({}, 'recurso area ehEssencial');

      res.status(200).json({ recursos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Recursos', error);
    res.status(500).json({ error: 'Erro ao buscar os Recursos' });
  }
};