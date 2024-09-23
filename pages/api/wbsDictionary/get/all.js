import connectToDatabase from '../../../../lib/db';
import WbsDictionaryModel from '../../../../models/wbs/wbsDictionary';

const { WbsDictionary } = WbsDictionaryModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
        const dicionarios = await WbsDictionary.find().sort({ area: 1 });

        res.status(200).json({ dicionarios });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar os WbsDictionarys', error);
    res.status(500).json({ error: 'Erro ao buscar os WbsDictionarys' });
  }
};