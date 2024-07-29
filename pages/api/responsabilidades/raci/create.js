import connectToDatabase from '../../../../lib/db';
import RaciModel from '../../../../models/responsabilidade/Raci';

const { Raci, RaciSchema } = RaciModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(RaciSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Raci(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Raci cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Raci', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Raci' });
  }
};
