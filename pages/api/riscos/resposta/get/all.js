import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import RespostaModel from '../../../../../models/riscos/Resposta';

const { Resposta } = RespostaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const riscoRespostas = await Resposta.find().sort({ risco: 1 });

      res.status(200).json({ riscoRespostas });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Respostas', error);
    res.status(500).json({ error: 'Erro ao buscar os Respostas' });
  }
};