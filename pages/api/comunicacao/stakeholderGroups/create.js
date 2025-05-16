import connectToDatabase from '../../../../lib/db';
import StakeholderGroupModel from '../../../../models/comunicacao/StakeholderGroup';

const { StakeholderGroup, StakeholderGroupSchema } = StakeholderGroupModel;

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const propriedadesNomes = Object.keys(StakeholderGroupSchema.paths);

      const requestBodyObject = {};
      propriedadesNomes.forEach(prop => {
        requestBodyObject[prop] = req.body[prop];
      });

      const newData = new StakeholderGroup(requestBodyObject);

      await newData.save();

      res.status(201).json({ message: 'StakeholderGroup cadastrado com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar o StakeholderGroup', error);
    res.status(500).json({ error: 'Erro ao cadastrar o StakeholderGroup' });
  }
};
