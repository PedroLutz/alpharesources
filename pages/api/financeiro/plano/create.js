import connectToDatabase from '../../../lib/db';
import PlanoModel from '../../../../models/financeiro/Plano';

const { Plano, PlanoSchema } = PlanoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(PlanoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Plano(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Plano cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Plano', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Plano' });
  }
};
