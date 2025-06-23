import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import WbsModel from '../../../../models/wbs/wbs';

const { Wbs } = WbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    const user = verificarAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (req.method === 'GET') {
      const areas = await Wbs.aggregate([
        {
          $group: {
            _id: '$area',
          }
        },
        { $sort: { _id: 1 } }  // Ordena pelo campo 'area' (ou seja, '_id' aqui)
      ]);

      res.status(200).json({ areas });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Wbss', error);
    res.status(500).json({ error: 'Erro ao buscar os Wbss' });
  }
};