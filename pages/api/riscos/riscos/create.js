import connectToDatabase from '../../../../lib/db';
import RiscoModel from '../../../../models/riscos/Risco';

const { Risco, RiscoSchema } = RiscoModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(RiscoSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Risco(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Risco cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Risco', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Risco' });
  }
};
