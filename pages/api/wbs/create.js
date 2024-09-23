import connectToDatabase from '../../../lib/db';
import WbsModel from '../../../models/wbs/wbs';

const { Wbs, WbsSchema } = WbsModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(WbsSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Wbs(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Wbs cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Wbs', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Wbs' });
  }
};
