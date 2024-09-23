import connectToDatabase from '../../../../lib/db';
import WbsModel from '../../../../models/wbs/wbs';

const { Wbs } = WbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const areasECores = await Wbs.aggregate([
        {
          $group: {
            _id: '$area',
            cor: { $addToSet: '$cor' }  // Agrupa as cores por área
          }
        },
        { $sort: { _id: 1 } }  // Ordena pelo campo 'area' (ou seja, '_id' aqui)
      ]);

      res.status(200).json({ areasECores });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os Wbss', error);
    res.status(500).json({ error: 'Erro ao buscar os Wbss' });
  }
};