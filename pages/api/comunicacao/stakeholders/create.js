import connectToDatabase from '../../../../lib/db';
import StakeholderModel from '../../../../models/comunicacao/Stakeholder';

const { Stakeholder, StakeholderSchema } = StakeholderModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(StakeholderSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new Stakeholder(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'Stakeholder cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o Stakeholder', error);
    res.status(500).json({ error: 'Erro ao cadastrar o Stakeholder' });
  }
};
