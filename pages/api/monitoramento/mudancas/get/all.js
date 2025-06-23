import connectToDatabase from '../../../../../lib/db';
import { verificarAuth } from '../../../../../lib/verifica_auth';
import MudancaModel from '../../../../../models/monitoramento/Mudanca';

const { Mudanca } = MudancaModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const mudancas = await Mudanca.find().sort({ data: 1, area: 1 });


      res.status(200).json({ mudancas });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Mudancas', error);
    res.status(500).json({ error: 'Erro ao buscar os Mudancas' });
  }
};