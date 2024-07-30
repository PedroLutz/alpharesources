import connectToDatabase from '../../../../lib/db';
import WbsModel from '../../../../models/WorkBS';

const { Wbs } = WbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const elementos = await Wbs.find().sort({ area: 1 });

        res.status(200).json({ elementos });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Wbss', error);
    res.status(500).json({ error: 'Erro ao buscar os Wbss' });
  }
};