import connectToDatabase from '../../../lib/db';
import WbsDictionaryModel from '../../../models/wbs/wbsDictionary';

const { WbsDictionary, WbsDictionarySchema } = WbsDictionaryModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(WbsDictionarySchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new WbsDictionary(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'WbsDictionary cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o WbsDictionary', error);
    res.status(500).json({ error: 'Erro ao cadastrar o WbsDictionary' });
  }
};