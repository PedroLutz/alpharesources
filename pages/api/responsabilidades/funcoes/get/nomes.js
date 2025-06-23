import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import FuncaoModel from '../../../../../models/responsabilidade/Funcao';

const { Funcao } = FuncaoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const funcoes = await Funcao.find({}, "funcao");

      res.status(200).json({ funcoes });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar funcoes', error);
    res.status(500).json({ error: 'Erro ao buscar funcoes' });
  }
};